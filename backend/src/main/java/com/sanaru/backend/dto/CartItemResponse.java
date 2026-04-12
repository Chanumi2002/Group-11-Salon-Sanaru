package com.sanaru.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CartItemResponse {
    private Long cartItemId;
    private Long productId;
    private String productName;
    private String imagePath;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subTotal;
    private Integer stockQuantity;
}