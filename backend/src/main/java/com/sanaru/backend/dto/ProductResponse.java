package com.sanaru.backend.dto;

import com.sanaru.backend.model.Category;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imagePath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Category> categories;
}