package com.sanaru.backend.controller;

import com.sanaru.backend.dto.PaymentTransactionResponse;
import com.sanaru.backend.model.PaymentTransaction;
import com.sanaru.backend.service.PaymentTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Story 4 – Store Payment Transaction Details
 *
 * Exposes read-only endpoints so that admins can audit every stored transaction
 * (order_id, payment_status, transaction_id, amount, payment_date).
 *
 * All write operations (create / update) are handled internally by PaymentService
 * during the PayHere webhook flow — they are NOT exposed as public REST endpoints.
 */
@RestController
@RequestMapping("/api/v1/payment-transactions")
@RequiredArgsConstructor
public class PaymentTransactionController {

    private final PaymentTransactionService paymentTransactionService;

    /**
     * GET /api/v1/payment-transactions
     * Returns all stored transaction records for admin auditing.
     * Restricted to ADMIN role.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentTransactionResponse>> getAllTransactions() {
        List<PaymentTransactionResponse> transactions = paymentTransactionService
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(transactions);
    }

    /**
     * GET /api/v1/payment-transactions/{id}
     * Returns a single transaction by its primary key.
     * Restricted to ADMIN role.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentTransactionResponse> getTransactionById(@PathVariable Long id) {
        return paymentTransactionService.findById(id)
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ---------------------------------------------------------------------------
    // Mapper
    // ---------------------------------------------------------------------------

    private PaymentTransactionResponse toResponse(PaymentTransaction t) {
        return PaymentTransactionResponse.builder()
                .id(t.getId())
                .orderId(t.getOrderId())
                .userId(t.getUserId())
                .paymentProvider(t.getPaymentProvider())
                .merchantReference(t.getMerchantReference())
                .transactionId(t.getTransactionId())
                .amount(t.getAmount())
                .currency(t.getCurrency())
                .paymentStatus(t.getStatus())
                .statusMessage(t.getStatusMessage())
                .paymentDate(t.getPaymentDate())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
