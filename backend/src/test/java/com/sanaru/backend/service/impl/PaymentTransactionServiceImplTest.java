package com.sanaru.backend.service.impl;

import com.sanaru.backend.enums.PaymentStatus;
import com.sanaru.backend.model.Order;
import com.sanaru.backend.model.PaymentTransaction;
import com.sanaru.backend.model.User;
import com.sanaru.backend.repository.PaymentTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentTransactionServiceImplTest {

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @InjectMocks
    private PaymentTransactionServiceImpl transactionService;

    private User user;
    private Order order;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(42L);
        order = new Order();
        order.setId(99L);
        order.setTotalAmount(BigDecimal.valueOf(123.45));
    }

    @Test
    void initializeTransaction_shouldCreateAndSavePendingTransaction() {
        when(paymentTransactionRepository.findByOrderId(order.getId())).thenReturn(Optional.empty());
        when(paymentTransactionRepository.save(any(PaymentTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PaymentTransaction transaction = transactionService.initializeTransaction(
                order,
                user,
                "ORD-99-TEST",
                "USD"
        );

        assertEquals(order.getId(), transaction.getOrderId());
        assertEquals(user.getId(), transaction.getUserId());
        assertEquals("PAYHERE", transaction.getPaymentProvider());
        assertEquals("ORD-99-TEST", transaction.getMerchantReference());
        assertEquals(order.getTotalAmount(), transaction.getAmount());
        assertEquals("USD", transaction.getCurrency());
        assertEquals(PaymentStatus.INITIATED, transaction.getStatus());
        assertEquals("Sandbox checkout initialized", transaction.getStatusMessage());
        assertNull(transaction.getPaymentDate());
    }

    @Test
    void applyNotificationPayload_shouldSetTransactionDetailsAndPaymentDate() {
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setAmount(BigDecimal.ZERO);

        Map<String, String> payload = Map.of(
                "payment_id", "PAY12345",
                "payhere_amount", "99.99",
                "status_message", "Payment successful"
        );

        PaymentTransaction updated = transactionService.applyNotificationPayload(transaction, payload);

        assertEquals("PAY12345", updated.getTransactionId());
        assertEquals("PAY12345", updated.getProviderPaymentRef());
        assertEquals(BigDecimal.valueOf(99.99), updated.getAmount());
        assertEquals("Payment successful", updated.getStatusMessage());
        assertNotNull(updated.getPaymentDate());
    }
}
