package com.sanaru.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {
    private List<String> recommendedServices;
    private List<String> recommendedProducts;
    private List<String> beautyTips;
    private String explanation;
}
