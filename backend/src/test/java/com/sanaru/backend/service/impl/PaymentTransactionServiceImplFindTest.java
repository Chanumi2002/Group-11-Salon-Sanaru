package com.sanaru.backend.service.impl;

import com.sanaru.backend.enums.PaymentStatus;
import com.sanaru.backend.model.PaymentTransaction;
import com.sanaru.backend.repository.PaymentTransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Story 4 – Unit tests for findById / findAll added to support admin auditing.
 */
@ExtendWith(MockitoExtension.class)
class PaymentTransactionServiceImplFindTest {

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @InjectMocks
    private PaymentTransactionServiceImpl transactionService;

    // -----------------------------------------------------------------------
    // findById
    // -----------------------------------------------------------------------

    @Test
    void findById_existingId_returnsTransaction() {
        PaymentTransaction tx = buildTransaction(1L, "ORD-001", PaymentStatus.SUCCESS);
        when(paymentTransactionRepository.findById(1L)).thenReturn(Optional.of(tx));

        Optional<PaymentTransaction> result = transactionService.findById(1L);

        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getOrderId());
        assertEquals(PaymentStatus.SUCCESS, result.get().getStatus());
    }

    @Test
    void findById_unknownId_returnsEmpty() {
        when(paymentTransactionRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<PaymentTransaction> result = transactionService.findById(999L);

        assertFalse(result.isPresent());
    }

    // -----------------------------------------------------------------------
    // findAll
    // -----------------------------------------------------------------------

    @Test
    void findAll_returnsAllTransactionsNewestFirst() {
        PaymentTransaction tx1 = buildTransaction(1L, "ORD-001", PaymentStatus.SUCCESS);
        tx1.setCreatedAt(LocalDateTime.now().minusHours(2));

        PaymentTransaction tx2 = buildTransaction(2L, "ORD-002", PaymentStatus.INITIATED);
        tx2.setCreatedAt(LocalDateTime.now().minusHours(1));

        // Simulate repo returning newest-first order (as the service requests)
        when(paymentTransactionRepository.findAll(any(Sort.class)))
                .thenReturn(List.of(tx2, tx1));

        List<PaymentTransaction> result = transactionService.findAll();

        assertEquals(2, result.size());
        // tx2 is newer – should be first
        assertEquals("ORD-002", result.get(0).getMerchantReference());
        assertEquals("ORD-001", result.get(1).getMerchantReference());
    }

    @Test
    void findAll_emptyTable_returnsEmptyList() {
        when(paymentTransactionRepository.findAll(any(Sort.class))).thenReturn(List.of());

        List<PaymentTransaction> result = transactionService.findAll();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private PaymentTransaction buildTransaction(Long orderId,
                                                String merchantReference,
                                                PaymentStatus status) {
        PaymentTransaction tx = new PaymentTransaction();
        tx.setOrderId(orderId);
        tx.setUserId(100L + orderId);
        tx.setPaymentProvider("PAYHERE");
        tx.setMerchantReference(merchantReference);
        tx.setTransactionId("TXN-" + orderId);
        tx.setAmount(new BigDecimal("1500.00"));
        tx.setCurrency("LKR");
        tx.setStatus(status);
        tx.setStatusMessage("Test");
        tx.setPaymentDate(status == PaymentStatus.SUCCESS ? LocalDateTime.now() : null);
        tx.setCreatedAt(LocalDateTime.now());
        tx.setUpdatedAt(LocalDateTime.now());
        return tx;
    }
}
