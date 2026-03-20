package com.sanaru.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class ServiceResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imagePath;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
