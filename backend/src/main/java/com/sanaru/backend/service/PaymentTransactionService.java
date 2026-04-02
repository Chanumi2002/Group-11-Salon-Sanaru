package com.sanaru.backend.service;

import com.sanaru.backend.model.Order;
import com.sanaru.backend.model.PaymentTransaction;
import com.sanaru.backend.model.User;

import java.util.Map;
import java.util.Optional;

public interface PaymentTransactionService {

    PaymentTransaction initializeTransaction(Order order, User user, String merchantReference, String currency);

    Optional<PaymentTransaction> findByMerchantReference(String merchantReference);

    Optional<PaymentTransaction> findLatestByOrderId(Long orderId);

    PaymentTransaction applyNotificationPayload(PaymentTransaction transaction, Map<String, String> payload);

    PaymentTransaction save(PaymentTransaction transaction);
}
