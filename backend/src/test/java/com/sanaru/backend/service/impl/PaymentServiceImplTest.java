package com.sanaru.backend.service.impl;

import com.sanaru.backend.config.PayHereConfig;
import com.sanaru.backend.dto.PaymentCallbackResponse;
import com.sanaru.backend.enums.OrderStatus;
import com.sanaru.backend.enums.PaymentStatus;
import com.sanaru.backend.model.Order;
import com.sanaru.backend.model.PaymentTransaction;
import com.sanaru.backend.model.User;
import com.sanaru.backend.repository.OrderRepository;
import com.sanaru.backend.repository.UserRepository;
import com.sanaru.backend.service.PaymentTransactionService;
import com.sanaru.backend.util.PayHereHashUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    /**
     * Must be PaymentTransactionService – not PaymentTransactionRepository.
     * PaymentServiceImpl depends on the SERVICE layer, not the repository directly.
     * Using the wrong type here causes paymentTransactionService to be null
     * inside PaymentServiceImpl, leading to NullPointerException at runtime.
     */
    @Mock
    private PaymentTransactionService paymentTransactionService;

    @Mock
    private PayHereConfig payHereConfig;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    @BeforeEach
    void setUp() {
        when(payHereConfig.getMerchantId()).thenReturn("MID123");
        when(payHereConfig.getMerchantSecret()).thenReturn("SECRET123");
    }

    @Test
    void handlePayHereNotify_successCallback_updatesOrderToPaid() {
        // Given: a PENDING order and an INITIATED transaction
        Order order = buildOrder(10L, OrderStatus.PENDING);
        PaymentTransaction transaction = buildTransaction(10L, "ORD-001", PaymentStatus.INITIATED);

        // Stub service (not repository) – this is what PaymentServiceImpl actually calls
        when(paymentTransactionService.findByMerchantReference("ORD-001"))
                .thenReturn(Optional.of(transaction));
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        // applyNotificationPayload sets transactionId/providerRef/paymentDate and returns the same object
        when(paymentTransactionService.applyNotificationPayload(eq(transaction), any()))
                .thenAnswer(invocation -> {
                    PaymentTransaction tx = invocation.getArgument(0);
                    tx.setTransactionId("PAY-123");
                    tx.setProviderPaymentRef("PAY-123");
                    tx.setPaymentDate(java.time.LocalDateTime.now());
                    return tx;
                });
        when(paymentTransactionService.save(transaction)).thenReturn(transaction);

        // When: PayHere sends status_code = 2 (SUCCESS)
        PaymentCallbackResponse response = paymentService.handlePayHereNotify(buildPayload("ORD-001", "2"));

        // Then: transaction is SUCCESS, order is PAID
        assertEquals(OrderStatus.PAID,      order.getStatus());
        assertEquals(PaymentStatus.SUCCESS, transaction.getStatus());
        assertEquals("PAY-123",             transaction.getProviderPaymentRef());
        assertTrue(response.isProcessed());
        assertTrue(response.isConfirmedPaid());
        assertEquals(OrderStatus.PAID, response.getOrderStatus());
        verify(paymentTransactionService).save(transaction);
        verify(orderRepository).save(order);
    }

    @Test
    void handlePayHereNotify_failedCallback_updatesOrderToFailed_andDoesNotConfirmPaid() {
        Order order = buildOrder(11L, OrderStatus.PENDING);
        PaymentTransaction transaction = buildTransaction(11L, "ORD-002", PaymentStatus.INITIATED);

        when(paymentTransactionService.findByMerchantReference("ORD-002")).thenReturn(Optional.of(transaction));
        when(orderRepository.findById(11L)).thenReturn(Optional.of(order));
        when(paymentTransactionService.applyNotificationPayload(eq(transaction), any())).thenReturn(transaction);
        when(paymentTransactionService.save(transaction)).thenReturn(transaction);

        PaymentCallbackResponse response = paymentService.handlePayHereNotify(buildPayload("ORD-002", "-2"));

        assertEquals(OrderStatus.FAILED,   order.getStatus());
        assertEquals(PaymentStatus.FAILED, transaction.getStatus());
        assertTrue(response.isProcessed());
        assertFalse(response.isConfirmedPaid());
        assertEquals(OrderStatus.FAILED, response.getOrderStatus());
        verify(paymentTransactionService).save(transaction);
        verify(orderRepository).save(order);
    }

    @Test
    void handlePayHereNotify_cancelledCallback_updatesOrderToCancelled_andDoesNotConfirmPaid() {
        Order order = buildOrder(12L, OrderStatus.PENDING);
        PaymentTransaction transaction = buildTransaction(12L, "ORD-003", PaymentStatus.INITIATED);

        when(paymentTransactionService.findByMerchantReference("ORD-003")).thenReturn(Optional.of(transaction));
        when(orderRepository.findById(12L)).thenReturn(Optional.of(order));
        when(paymentTransactionService.applyNotificationPayload(eq(transaction), any())).thenReturn(transaction);
        when(paymentTransactionService.save(transaction)).thenReturn(transaction);

        PaymentCallbackResponse response = paymentService.handlePayHereNotify(buildPayload("ORD-003", "-1"));

        assertEquals(OrderStatus.CANCELLED,   order.getStatus());
        assertEquals(PaymentStatus.CANCELLED, transaction.getStatus());
        assertTrue(response.isProcessed());
        assertFalse(response.isConfirmedPaid());
        assertEquals(OrderStatus.CANCELLED, response.getOrderStatus());
        verify(paymentTransactionService).save(transaction);
        verify(orderRepository).save(order);
    }

    @Test
    void handlePayHereNotify_pendingCallback_keepsOrderPending_andDoesNotConfirmPaid() {
        Order order = buildOrder(15L, OrderStatus.PENDING);
        PaymentTransaction transaction = buildTransaction(15L, "ORD-006", PaymentStatus.INITIATED);

        when(paymentTransactionService.findByMerchantReference("ORD-006")).thenReturn(Optional.of(transaction));
        when(orderRepository.findById(15L)).thenReturn(Optional.of(order));
        when(paymentTransactionService.applyNotificationPayload(eq(transaction), any())).thenReturn(transaction);
        when(paymentTransactionService.save(transaction)).thenReturn(transaction);

        PaymentCallbackResponse response = paymentService.handlePayHereNotify(buildPayload("ORD-006", "0"));

        assertEquals(OrderStatus.PENDING,   order.getStatus());
        assertEquals(PaymentStatus.INITIATED, transaction.getStatus());
        assertTrue(response.isProcessed());
        assertFalse(response.isConfirmedPaid());
        verify(paymentTransactionService).save(transaction);
        verify(orderRepository).save(order);
    }

    @Test
    void handlePayHereNotify_alreadyPaidOrder_cannotBeDowngraded() {
        Order order = buildOrder(13L, OrderStatus.PAID);
        PaymentTransaction transaction = buildTransaction(13L, "ORD-004", PaymentStatus.SUCCESS);

        when(paymentTransactionService.findByMerchantReference("ORD-004")).thenReturn(Optional.of(transaction));
        when(orderRepository.findById(13L)).thenReturn(Optional.of(order));
        when(paymentTransactionService.applyNotificationPayload(eq(transaction), any())).thenReturn(transaction);
        when(paymentTransactionService.save(transaction)).thenReturn(transaction);

        PaymentCallbackResponse response = paymentService.handlePayHereNotify(buildPayload("ORD-004", "-1"));

        assertEquals(OrderStatus.PAID, order.getStatus());
        assertEquals(PaymentStatus.SUCCESS, transaction.getStatus());
        assertFalse(response.isProcessed());
        assertTrue(response.isConfirmedPaid());
        verify(paymentTransactionService).save(transaction);
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void handlePayHereNotify_withoutExistingTransaction_createsContextFromOrderReference() {
        Order order = buildOrder(16L, OrderStatus.PENDING);
        order.setOrderNumber("ORD-007");

        when(paymentTransactionService.findByMerchantReference("ORD-007")).thenReturn(Optional.empty());
        when(orderRepository.findByOrderNumber("ORD-007")).thenReturn(Optional.of(order));
        when(paymentTransactionService.findLatestByOrderId(16L)).thenReturn(Optional.empty());
        when(paymentTransactionService.applyNotificationPayload(any(), any()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentTransactionService.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentCallbackResponse response = paymentService.handlePayHereNotify(buildPayload("ORD-007", "2"));

        assertTrue(response.isProcessed());
        assertTrue(response.isConfirmedPaid());
        verify(paymentTransactionService).save(any(PaymentTransaction.class));
        verify(orderRepository).save(order);
    }

    @Test
    void handlePayHereNotify_invalidOrderReference_throwsIllegalArgumentException() {
        when(paymentTransactionService.findByMerchantReference("UNKNOWN-ORDER")).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> paymentService.handlePayHereNotify(buildPayload("UNKNOWN-ORDER", "2"))
        );

        assertTrue(ex.getMessage().contains("not found"));
        verify(orderRepository, never()).findById(any());
    }

    @Test
    void handlePayHereNotify_numericOrderReference_findsLatestTransaction() {
        Order order = buildOrder(14L, OrderStatus.PENDING);
        PaymentTransaction transaction = buildTransaction(14L, "ORD-005", PaymentStatus.INITIATED);

        when(paymentTransactionService.findByMerchantReference("14")).thenReturn(Optional.empty());
        when(paymentTransactionService.findLatestByOrderId(eq(14L))).thenReturn(Optional.of(transaction));
        when(orderRepository.findById(14L)).thenReturn(Optional.of(order));
        when(paymentTransactionService.applyNotificationPayload(eq(transaction), any())).thenReturn(transaction);
        when(paymentTransactionService.save(transaction)).thenReturn(transaction);

        PaymentCallbackResponse response = paymentService.handlePayHereNotify(buildPayload("14", "2"));

        assertTrue(response.isConfirmedPaid());
        assertEquals(OrderStatus.PAID,      order.getStatus());
        assertEquals(PaymentStatus.SUCCESS, transaction.getStatus());
    }

    private Map<String, String> buildPayload(String orderRef, String statusCode) {
        Map<String, String> payload = new HashMap<>();
        payload.put("merchant_id", "MID123");
        payload.put("order_id", orderRef);
        payload.put("payment_id", "PAY-123");
        payload.put("payhere_amount", "1000.00");
        payload.put("payhere_currency", "LKR");
        payload.put("status_code", statusCode);
        payload.put("status_message", "Test callback");
        payload.put(
                "md5sig",
                PayHereHashUtil.generateNotifySignature(
                        "MID123",
                        orderRef,
                        "1000.00",
                        "LKR",
                        statusCode,
                        "SECRET123"
                )
        );
        return payload;
    }

    private Order buildOrder(Long id, OrderStatus status) {
        Order order = new Order();
        order.setId(id);
        order.setStatus(status);
        order.setOrderNumber("ORD-" + id);
        order.setTotalAmount(new BigDecimal("1000.00"));

        User user = new User();
        user.setId(100L + id);
        order.setUser(user);

        return order;
    }

    private PaymentTransaction buildTransaction(Long orderId, String merchantReference, PaymentStatus status) {
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setOrderId(orderId);
        transaction.setMerchantReference(merchantReference);
        transaction.setPaymentProvider("PAYHERE");
        transaction.setAmount(new BigDecimal("1000.00"));
        transaction.setCurrency("LKR");
        transaction.setStatus(status);
        return transaction;
    }
}
