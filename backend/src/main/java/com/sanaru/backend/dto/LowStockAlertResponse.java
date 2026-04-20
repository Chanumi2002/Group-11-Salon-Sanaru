package com.sanaru.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Story 1 – Inventory Tracking
 * Returned by GET /api/admin/inventory/low-stock
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LowStockAlertResponse {
    private Long productId;
    private String productName;
    private Integer stockQuantity;
    private Integer lowStockThreshold;
    private boolean outOfStock;
}
