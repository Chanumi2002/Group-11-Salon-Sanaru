package com.sanaru.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RecommendationRequest {
    @NotBlank(message = "Skin type is required")
    private String skinType;

    @NotBlank(message = "Hair type is required")
    private String hairType;

    @NotBlank(message = "Face shape is required")
    private String faceShape;

    @NotBlank(message = "Age is required")
    private String age;

    private String concerns;
}
