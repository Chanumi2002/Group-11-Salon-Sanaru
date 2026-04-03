package com.sanaru.backend.enums;

public enum OrderStatus {
    PENDING,
    PENDING_PAYMENT,
    PAID,               // legacy – kept for backward-compat with existing DB rows
    CONFIRMED,          // Story 5: set automatically on successful payment
    FAILED,
    CANCELLED,
    CANCELLATION_REQUESTED  // customer has requested cancellation; awaiting admin review
}
