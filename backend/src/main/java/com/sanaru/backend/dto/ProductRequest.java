package com.sanaru.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ProductRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private String imagePath;
    private Long categoryId;
    private List<Long> categoryIds;
}