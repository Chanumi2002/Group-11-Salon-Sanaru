package com.sanaru.backend.service.impl;

import com.sanaru.backend.config.PayHereConfig;
import com.sanaru.backend.dto.PayHereCancelRequest;
import com.sanaru.backend.dto.PayHereCheckoutResponse;
import com.sanaru.backend.dto.PaymentCallbackResponse;
import com.sanaru.backend.enums.OrderStatus;
import com.sanaru.backend.enums.PaymentStatus;
import com.sanaru.backend.model.Order;
import com.sanaru.backend.model.PaymentTransaction;
import com.sanaru.backend.model.User;
import com.sanaru.backend.repository.OrderRepository;
import com.sanaru.backend.repository.UserRepository;
import com.sanaru.backend.service.PaymentService;
import com.sanaru.backend.service.PaymentTransactionService;
import com.sanaru.backend.util.PayHereHashUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private static final String PAYHERE_GATEWAY = "PAYHERE";

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PaymentTransactionService paymentTransactionService;
    private final PayHereConfig payHereConfig;

    @Override
    @Transactional
    public PayHereCheckoutResponse preparePayHereCheckout(Long orderId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getUser() == null || !order.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not allowed to pay for this order");
        }

        if (!isPendingOrderStatus(order.getStatus())) {
            throw new RuntimeException("Order is not in pending payment status");
        }

        String merchantReference = order.getOrderNumber();
        if (merchantReference == null || merchantReference.isBlank()) {
            merchantReference = "ORD-" + order.getId() + "-" + UUID.randomUUID().toString().substring(0, 8);
            order.setOrderNumber(merchantReference);
            orderRepository.save(order);
        }

        paymentTransactionService.initializeTransaction(
                order,
                user,
                merchantReference,
                payHereConfig.getCurrency()
        );

        String amount = order.getTotalAmount().setScale(2).toPlainString();

        String hash = PayHereHashUtil.generateHash(
                payHereConfig.getMerchantId(),
                merchantReference,
                amount,
                payHereConfig.getCurrency(),
                payHereConfig.getMerchantSecret()
        );

        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("merchant_id", payHereConfig.getMerchantId());
        fields.put("return_url", payHereConfig.getReturnUrl());
        fields.put("cancel_url", payHereConfig.getCancelUrl());
        fields.put("notify_url", payHereConfig.getNotifyUrl());
        fields.put("order_id", merchantReference);
        fields.put("items", "Order " + merchantReference);
        fields.put("currency", payHereConfig.getCurrency());
        fields.put("amount", amount);
        fields.put("first_name", user.getFirstName() != null ? user.getFirstName() : "Customer");
        fields.put("last_name", user.getLastName() != null ? user.getLastName() : "");
        fields.put("email", user.getEmail());
        fields.put("phone", user.getPhone() != null ? user.getPhone() : "0770000000");
        fields.put("address", "N/A");
        fields.put("city", "Colombo");
        fields.put("country", "Sri Lanka");
        fields.put("hash", hash);

        return PayHereCheckoutResponse.builder()
                .action(payHereConfig.getCheckoutUrl())
                .method("POST")
                .fields(fields)
                .build();
    }

    @Override
    @Transactional
    public PaymentCallbackResponse handlePayHereNotify(Map<String, String> payload) {
        String merchantId = trimToNull(payload.get("merchant_id"));
        String orderReference = trimToNull(payload.get("order_id"));
        String paymentId = trimToNull(payload.get("payment_id"));
        String payhereAmount = trimToNull(payload.get("payhere_amount"));
        String payhereCurrency = trimToNull(payload.get("payhere_currency"));
        String statusCode = trimToNull(payload.get("status_code"));
        String md5sig = trimToNull(payload.get("md5sig"));
        String statusMessage = trimToNull(payload.get("status_message"));

        boolean signatureValidationPassed = false;

        log.info(
                "PayHere notify received: merchant_id={}, order_id={}, payment_id={}, status_code={}, status_message={}",
                merchantId,
                orderReference,
                paymentId,
                statusCode,
                statusMessage
        );

        if (merchantId == null || orderReference == null || payhereAmount == null || payhereCurrency == null
                || statusCode == null || md5sig == null) {
            throw new IllegalArgumentException("Missing required PayHere notify fields");
        }

        if (!payHereConfig.getMerchantId().equals(merchantId)) {
            throw new IllegalArgumentException("Invalid merchant id");
        }

        String localMd5Sig = PayHereHashUtil.generateNotifySignature(
                merchantId,
                orderReference,
                payhereAmount,
                payhereCurrency,
                statusCode,
                payHereConfig.getMerchantSecret()
        );

        signatureValidationPassed = localMd5Sig.equalsIgnoreCase(md5sig);

        log.info(
                "PayHere notify signature validation: merchant_id={}, order_id={}, passed={}",
                merchantId,
                orderReference,
                signatureValidationPassed
        );

        if (!signatureValidationPassed) {
            throw new IllegalArgumentException("Invalid PayHere signature");
        }

        ResolvedPaymentContext paymentContext = resolveOrCreateContext(orderReference, payhereAmount, payhereCurrency);
        PaymentTransaction transaction = paymentContext.transaction();
        Order order = paymentContext.order();

        PaymentStatus incomingPaymentStatus = resolvePaymentStatus(statusCode);

        transaction = paymentTransactionService.applyNotificationPayload(transaction, payload);

        if (order.getStatus() == OrderStatus.PAID && incomingPaymentStatus != PaymentStatus.SUCCESS) {
            log.info(
                    "Ignoring PayHere callback that would downgrade paid order: order_id={}, status_code={}",
                    orderReference,
                    statusCode
            );

            paymentTransactionService.save(transaction);

            return PaymentCallbackResponse.builder()
                    .processed(false)
                    .confirmedPaid(true)
                    .orderId(order.getId())
                    .orderReference(transaction.getMerchantReference())
                    .orderStatus(order.getStatus())
                    .paymentStatus(transaction.getStatus())
                    .message("Order already paid. Non-success callback ignored")
                    .build();
        }

        if (incomingPaymentStatus == PaymentStatus.INITIATED && isTerminalOrderStatus(order.getStatus())) {
            log.info(
                    "Ignoring pending callback for terminal order: order_id={}, status_code={}, current_status={}",
                    orderReference,
                    statusCode,
                    order.getStatus()
            );

            paymentTransactionService.save(transaction);

            return PaymentCallbackResponse.builder()
                    .processed(false)
                    .confirmedPaid(order.getStatus() == OrderStatus.PAID)
                    .orderId(order.getId())
                    .orderReference(transaction.getMerchantReference())
                    .orderStatus(order.getStatus())
                    .paymentStatus(transaction.getStatus())
                    .message("Pending callback ignored for terminal order")
                    .build();
        }

        updateStatusesForCallback(order, transaction, incomingPaymentStatus);

        paymentTransactionService.save(transaction);
        orderRepository.save(order);

        log.info(
                "PayHere notify processed: merchant_id={}, order_id={}, payment_id={}, status_code={}, status_message={}, signature_validation_passed={}, transaction_found={}, order_updated_to_paid={}",
                merchantId,
                orderReference,
                paymentId,
                statusCode,
                statusMessage,
                signatureValidationPassed,
                true,
                order.getStatus() == OrderStatus.PAID
        );

        return PaymentCallbackResponse.builder()
                .processed(true)
                .confirmedPaid(order.getStatus() == OrderStatus.PAID)
                .orderId(order.getId())
                .orderReference(transaction.getMerchantReference())
                .orderStatus(order.getStatus())
                .paymentStatus(transaction.getStatus())
                .message(resolveCallbackMessage(incomingPaymentStatus))
                .build();
    }

    @Override
    @Transactional
    public PaymentCallbackResponse handlePayHereCancel(PayHereCancelRequest request) {
        String orderReference = trimToNull(request.getOrderReference());
        String reason = trimToNull(request.getReason());

        if (orderReference == null) {
            throw new IllegalArgumentException("orderReference is required");
        }

        PaymentTransaction transaction = resolveTransaction(orderReference)
                .orElseThrow(() -> new IllegalArgumentException("Order/payment record not found for reference: " + orderReference));

        Order order = orderRepository.findById(transaction.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found for transaction"));

        if (order.getStatus() != OrderStatus.PAID) {
            order.setStatus(OrderStatus.CANCELLED);
            transaction.setStatus(PaymentStatus.CANCELLED);
        }

        transaction.setStatusMessage(reason != null ? reason : "Payment cancelled by customer");

        paymentTransactionService.save(transaction);
        orderRepository.save(order);

        boolean confirmedPaid = order.getStatus() == OrderStatus.PAID;

        return PaymentCallbackResponse.builder()
                .processed(!confirmedPaid)
                .confirmedPaid(confirmedPaid)
                .orderId(order.getId())
                .orderReference(transaction.getMerchantReference())
                .orderStatus(order.getStatus())
                .paymentStatus(transaction.getStatus())
                .message(confirmedPaid
                        ? "Order already paid. Cancellation ignored"
                        : "Order cancelled successfully")
                .build();
    }

    private void updateStatusesForCallback(Order order, PaymentTransaction transaction, PaymentStatus incomingPaymentStatus) {
        switch (incomingPaymentStatus) {
            case SUCCESS -> {
                transaction.setStatus(PaymentStatus.SUCCESS);
                order.setStatus(OrderStatus.PAID);
            }
            case FAILED -> {
                transaction.setStatus(PaymentStatus.FAILED);
                order.setStatus(OrderStatus.FAILED);
            }
            case CANCELLED -> {
                transaction.setStatus(PaymentStatus.CANCELLED);
                order.setStatus(OrderStatus.CANCELLED);
            }
            case INITIATED -> {
                transaction.setStatus(PaymentStatus.INITIATED);
                if (isPendingOrderStatus(order.getStatus())) {
                    order.setStatus(OrderStatus.PENDING);
                }
            }
            default -> throw new IllegalArgumentException("Unhandled payment status: " + incomingPaymentStatus);
        }
    }

    private String resolveCallbackMessage(PaymentStatus incomingPaymentStatus) {
        return switch (incomingPaymentStatus) {
            case SUCCESS -> "Payment confirmed successfully";
            case FAILED -> "Payment failed";
            case CANCELLED -> "Payment cancelled";
            case INITIATED -> "Payment is pending";
            default -> "Payment callback processed";
        };
    }

    private Optional<PaymentTransaction> resolveTransaction(String orderReference) {
        return paymentTransactionService.findByMerchantReference(orderReference)
                .or(() -> resolveByNumericOrderId(orderReference));
    }

    private PaymentStatus resolvePaymentStatus(String statusCode) {
        return switch (statusCode) {
            case "2" -> PaymentStatus.SUCCESS;
            case "0" -> PaymentStatus.INITIATED;
            case "-1" -> PaymentStatus.CANCELLED;
            case "-2", "-3" -> PaymentStatus.FAILED;
            default -> throw new IllegalArgumentException("Unknown PayHere status code: " + statusCode);
        };
    }

    private ResolvedPaymentContext resolveOrCreateContext(String orderReference, String payhereAmount, String payhereCurrency) {
        Optional<PaymentTransaction> existingTransaction = resolveTransaction(orderReference);

        if (existingTransaction.isPresent()) {
            PaymentTransaction transaction = existingTransaction.get();
            Order order = orderRepository.findById(transaction.getOrderId())
                    .orElseThrow(() -> new IllegalArgumentException("Order not found for transaction"));
            return new ResolvedPaymentContext(order, transaction);
        }

        Order order = resolveOrderByReference(orderReference)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Payment transaction and order not found for reference/order_id: " + orderReference));

        if (order.getUser() == null || order.getUser().getId() == null) {
            throw new IllegalArgumentException("Order user is missing for reference/order_id: " + orderReference);
        }

        PaymentTransaction transaction = paymentTransactionService.findLatestByOrderId(order.getId())
                .orElseGet(PaymentTransaction::new);

        transaction.setOrderId(order.getId());
        transaction.setUserId(order.getUser().getId());
        transaction.setPaymentProvider(PAYHERE_GATEWAY);
        transaction.setMerchantReference(
                (order.getOrderNumber() == null || order.getOrderNumber().isBlank()) ? orderReference : order.getOrderNumber()
        );
        transaction.setAmount(parseAmount(payhereAmount).orElse(order.getTotalAmount()));
        transaction.setCurrency((payhereCurrency == null || payhereCurrency.isBlank()) ? payHereConfig.getCurrency() : payhereCurrency);
        transaction.setStatus(PaymentStatus.INITIATED);
        transaction.setStatusMessage("Transaction created from callback");

        return new ResolvedPaymentContext(order, transaction);
    }

    private Optional<Order> resolveOrderByReference(String orderReference) {
        Optional<Order> byOrderNumber = orderRepository.findByOrderNumber(orderReference);
        if (byOrderNumber.isPresent()) {
            return byOrderNumber;
        }

        try {
            Long orderId = Long.parseLong(orderReference);
            return orderRepository.findById(orderId);
        } catch (NumberFormatException ex) {
            return Optional.empty();
        }
    }

    private Optional<PaymentTransaction> resolveByNumericOrderId(String orderReference) {
        try {
            Long numericOrderId = Long.parseLong(orderReference);
            return paymentTransactionService.findLatestByOrderId(numericOrderId);
        } catch (NumberFormatException ex) {
            return Optional.empty();
        }
    }

    private boolean isPendingOrderStatus(OrderStatus status) {
        return status == OrderStatus.PENDING || status == OrderStatus.PENDING_PAYMENT;
    }

    private boolean isTerminalOrderStatus(OrderStatus status) {
        return status == OrderStatus.PAID || status == OrderStatus.FAILED || status == OrderStatus.CANCELLED;
    }

    private Optional<BigDecimal> parseAmount(String amount) {
        if (amount == null || amount.isBlank()) {
            return Optional.empty();
        }

        try {
            return Optional.of(new BigDecimal(amount));
        } catch (NumberFormatException ex) {
            log.warn("Unable to parse PayHere amount: {}", amount);
            return Optional.empty();
        }
    }

    private record ResolvedPaymentContext(Order order, PaymentTransaction transaction) {
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}