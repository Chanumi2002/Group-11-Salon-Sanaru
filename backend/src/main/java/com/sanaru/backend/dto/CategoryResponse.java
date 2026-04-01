package com.sanaru.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class CategoryResponse {
    private Long id;
    private String name;
    private String imagePath;
}
