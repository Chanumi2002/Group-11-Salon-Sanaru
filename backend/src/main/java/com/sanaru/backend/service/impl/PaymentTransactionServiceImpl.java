package com.sanaru.backend.service.impl;

import com.sanaru.backend.enums.PaymentStatus;
import com.sanaru.backend.model.Order;
import com.sanaru.backend.model.PaymentTransaction;
import com.sanaru.backend.model.User;
import com.sanaru.backend.repository.PaymentTransactionRepository;
import com.sanaru.backend.service.PaymentTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentTransactionServiceImpl implements PaymentTransactionService {

    private final PaymentTransactionRepository paymentTransactionRepository;

    @Override
    public PaymentTransaction initializeTransaction(Order order, User user, String merchantReference, String currency) {
        PaymentTransaction transaction = paymentTransactionRepository
                .findByOrderId(order.getId())
                .orElseGet(PaymentTransaction::new);

        transaction.setOrderId(order.getId());
        transaction.setUserId(user.getId());
        transaction.setPaymentProvider("PAYHERE");
        transaction.setMerchantReference(merchantReference);
        transaction.setAmount(order.getTotalAmount());
        transaction.setCurrency(currency);
        transaction.setStatus(PaymentStatus.INITIATED);
        transaction.setStatusMessage("Sandbox checkout initialized");
        transaction.setPaymentDate(null);

        return paymentTransactionRepository.save(transaction);
    }

    @Override
    public Optional<PaymentTransaction> findByMerchantReference(String merchantReference) {
        return paymentTransactionRepository.findByMerchantReference(merchantReference);
    }

    @Override
    public Optional<PaymentTransaction> findLatestByOrderId(Long orderId) {
        return paymentTransactionRepository.findTopByOrderIdOrderByCreatedAtDesc(orderId);
    }

    @Override
    public PaymentTransaction applyNotificationPayload(PaymentTransaction transaction, Map<String, String> payload) {
        String statusMessage = trimToNull(payload.get("status_message"));
        String paymentId = trimToNull(payload.get("payment_id"));
        String amountString = trimToNull(payload.get("payhere_amount"));

        if (paymentId != null) {
            transaction.setTransactionId(paymentId);
            transaction.setProviderPaymentRef(paymentId);
        }

        if (statusMessage != null) {
            transaction.setStatusMessage(statusMessage);
        }

        if (amountString != null) {
            try {
                BigDecimal parsedAmount = new BigDecimal(amountString);
                transaction.setAmount(parsedAmount);
            } catch (NumberFormatException ignored) {
                // keep existing amount if payload amount is invalid
            }
        }

        transaction.setPaymentDate(LocalDateTime.now());

        return transaction;
    }

    @Override
    public PaymentTransaction save(PaymentTransaction transaction) {
        return paymentTransactionRepository.save(transaction);
    }

    @Override
    public Optional<PaymentTransaction> findById(Long id) {
        return paymentTransactionRepository.findById(id);
    }

    @Override
    public List<PaymentTransaction> findAll() {
        // Returns all transactions sorted newest-first for the admin audit view
        return paymentTransactionRepository.findAll(
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
