package com.sanaru.backend.controller;

import com.sanaru.backend.enums.PaymentStatus;
import com.sanaru.backend.model.PaymentTransaction;
import com.sanaru.backend.service.PaymentTransactionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

/**
 * Story 4 – Unit tests for PaymentTransactionController.
 *
 * Verifies that:
 *  - GET /api/v1/payment-transactions returns all stored records with full fields
 *  - GET /api/v1/payment-transactions/{id} returns 200 for found, 404 for missing
 */
@ExtendWith(MockitoExtension.class)
class PaymentTransactionControllerTest {

    @Mock
    private PaymentTransactionService paymentTransactionService;

    @InjectMocks
    private PaymentTransactionController controller;

    // -----------------------------------------------------------------------
    // getAllTransactions
    // -----------------------------------------------------------------------

    @Test
    void getAllTransactions_returnsList_withAllRequiredFields() {
        PaymentTransaction tx1 = buildTransaction(10L, 1L, "TXN-AAA", PaymentStatus.SUCCESS, new BigDecimal("2500.00"));
        PaymentTransaction tx2 = buildTransaction(11L, 2L, "TXN-BBB", PaymentStatus.FAILED,  new BigDecimal("800.00"));

        when(paymentTransactionService.findAll()).thenReturn(List.of(tx1, tx2));

        var response = controller.getAllTransactions();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        var body = response.getBody();
        assertNotNull(body);
        assertEquals(2, body.size());

        // Verify first record has all Story-4 required fields populated
        var first = body.get(0);
        assertEquals(10L,                         first.getOrderId());          // order_id ✔
        assertEquals(PaymentStatus.SUCCESS,        first.getPaymentStatus());   // payment_status ✔
        assertEquals("TXN-AAA",                   first.getTransactionId());   // transaction_id ✔
        assertEquals(new BigDecimal("2500.00"),   first.getAmount());          // amount ✔
        assertNotNull(first.getPaymentDate());                                 // payment_date ✔
    }

    @Test
    void getAllTransactions_emptyTable_returnsEmptyList() {
        when(paymentTransactionService.findAll()).thenReturn(List.of());

        var response = controller.getAllTransactions();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
    }

    // -----------------------------------------------------------------------
    // getTransactionById
    // -----------------------------------------------------------------------

    @Test
    void getTransactionById_found_returns200WithPayload() {
        PaymentTransaction tx = buildTransaction(5L, 3L, "TXN-XYZ", PaymentStatus.SUCCESS, new BigDecimal("1200.00"));
        when(paymentTransactionService.findById(3L)).thenReturn(Optional.of(tx));

        ResponseEntity<?> response = controller.getTransactionById(3L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        var dto = (com.sanaru.backend.dto.PaymentTransactionResponse) response.getBody();
        assertNotNull(dto);
        assertEquals(5L,                          dto.getOrderId());
        assertEquals("TXN-XYZ",                  dto.getTransactionId());
        assertEquals(PaymentStatus.SUCCESS,       dto.getPaymentStatus());
        assertEquals(new BigDecimal("1200.00"),  dto.getAmount());
    }

    @Test
    void getTransactionById_notFound_returns404() {
        when(paymentTransactionService.findById(999L)).thenReturn(Optional.empty());

        ResponseEntity<?> response = controller.getTransactionById(999L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private PaymentTransaction buildTransaction(Long orderId,
                                                Long dbId,
                                                String txnId,
                                                PaymentStatus status,
                                                BigDecimal amount) {
        PaymentTransaction tx = new PaymentTransaction();
        tx.setOrderId(orderId);
        tx.setUserId(200L);
        tx.setPaymentProvider("PAYHERE");
        tx.setMerchantReference("ORD-" + orderId);
        tx.setTransactionId(txnId);
        tx.setProviderPaymentRef(txnId);
        tx.setAmount(amount);
        tx.setCurrency("LKR");
        tx.setStatus(status);
        tx.setStatusMessage("Test status");
        tx.setPaymentDate(status == PaymentStatus.SUCCESS ? LocalDateTime.now() : null);
        tx.setCreatedAt(LocalDateTime.now());
        tx.setUpdatedAt(LocalDateTime.now());
        return tx;
    }
}
