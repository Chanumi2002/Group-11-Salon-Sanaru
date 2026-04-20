package com.sanaru.backend.dto;

import com.sanaru.backend.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO that exposes every stored transaction field required by Story 4.
 * Returned by PaymentTransactionController for auditing and tracking purposes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransactionResponse {

    private Long id;

    /** Maps to payment_transactions.order_id */
    private Long orderId;

    /** Maps to payment_transactions.user_id */
    private Long userId;

    /** Payment gateway used (e.g. PAYHERE) */
    private String paymentProvider;

    /** Merchant-side order reference (our internal order number) */
    private String merchantReference;

    /** Gateway-assigned payment/transaction ID */
    private String transactionId;

    /** Maps to payment_transactions.amount */
    private BigDecimal amount;

    /** Currency code (e.g. LKR) */
    private String currency;

    /** Maps to payment_transactions.status (INITIATED / SUCCESS / FAILED / CANCELLED) */
    private PaymentStatus paymentStatus;

    /** Human-readable status message from the gateway */
    private String statusMessage;

    /** When the payment was confirmed by the gateway */
    private LocalDateTime paymentDate;

    /** When this record was first created */
    private LocalDateTime createdAt;

    /** When this record was last modified */
    private LocalDateTime updatedAt;
}
