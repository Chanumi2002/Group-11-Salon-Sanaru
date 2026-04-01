package com.sanaru.backend.service.impl;

import com.sanaru.backend.config.PayHereConfig;
import com.sanaru.backend.dto.PayHereCheckoutResponse;
import com.sanaru.backend.enums.OrderStatus;
import com.sanaru.backend.enums.PaymentStatus;
import com.sanaru.backend.model.Order;
import com.sanaru.backend.model.PaymentTransaction;
import com.sanaru.backend.model.User;
import com.sanaru.backend.repository.OrderRepository;
import com.sanaru.backend.repository.PaymentTransactionRepository;
import com.sanaru.backend.repository.UserRepository;
import com.sanaru.backend.service.PaymentService;
import com.sanaru.backend.util.PayHereHashUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PayHereConfig payHereConfig;

    @Override
    public PayHereCheckoutResponse preparePayHereCheckout(Long orderId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getUser() == null || !order.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not allowed to pay for this order");
        }

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new RuntimeException("Order is not in pending payment status");
        }

        String merchantReference = order.getOrderNumber();
        if (merchantReference == null || merchantReference.isBlank()) {
            merchantReference = "ORD-" + order.getId() + "-" + UUID.randomUUID().toString().substring(0, 8);
        }

        PaymentTransaction transaction = paymentTransactionRepository
                .findByOrderId(order.getId())
                .orElseGet(PaymentTransaction::new);

        transaction.setOrderId(order.getId());
        transaction.setUserId(user.getId());
        transaction.setPaymentProvider("PAYHERE");
        transaction.setMerchantReference(merchantReference);
        transaction.setAmount(order.getTotalAmount());
        transaction.setCurrency(payHereConfig.getCurrency());
        transaction.setStatus(PaymentStatus.INITIATED);
        transaction.setStatusMessage("Sandbox checkout initialized");

        paymentTransactionRepository.save(transaction);

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
}