package com.sanaru.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Story 1 – Inventory Tracking
 * Dedicated request body for admin stock-update endpoint.
 */
@Getter
@Setter
public class InventoryUpdateRequest {

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    @Min(value = 0, message = "Low-stock threshold cannot be negative")
    private Integer lowStockThreshold; // optional; if null, existing value is preserved
}
