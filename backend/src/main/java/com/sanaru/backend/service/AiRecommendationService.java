package com.sanaru.backend.service;

import com.sanaru.backend.dto.RecommendationRequest;
import com.sanaru.backend.dto.RecommendationResponse;

public interface AiRecommendationService {
    RecommendationResponse getRecommendations(RecommendationRequest request);
}
