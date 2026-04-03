package com.sanaru.backend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sanaru.backend.dto.RecommendationRequest;
import com.sanaru.backend.dto.RecommendationResponse;
import com.sanaru.backend.service.AiRecommendationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GroqRecommendationServiceImpl implements AiRecommendationService {

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.model}")
    private String apiModel;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GroqRecommendationServiceImpl(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    @SuppressWarnings("unchecked")
    public RecommendationResponse getRecommendations(RecommendationRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        String systemPrompt = "You are an expert beauty consultant at Salon Sanaru. " +
                "Provide personalized beauty recommendations based on user characteristics. " +
                "Return ONLY a valid JSON object matching exactly this structure with strings arrays where applicable: " +
                "{\"recommendedServices\": [\"string\"], \"recommendedProducts\": [\"string\"], \"beautyTips\": [\"string\"], \"explanation\": \"string\"}";

        String userPrompt = String.format("My details: \nSkin Type: %s\nHair Type: %s\nFace Shape: %s\nAge: %s\nConcerns: %s\n\n" +
                "Please give me recommendations.",
                request.getSkinType(), request.getHairType(), request.getFaceShape(), request.getAge(), request.getConcerns());

        Map<String, Object> requestBody = Map.of(
                "model", apiModel,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "response_format", Map.of("type", "json_object")
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            Map<String, Object> response = responseEntity.getBody();

            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String content = (String) message.get("content");
                    return objectMapper.readValue(content, RecommendationResponse.class);
                }
            }
            throw new RuntimeException("Invalid response format from Groq API");
        } catch (Exception e) {
            e.printStackTrace();
            if (e instanceof org.springframework.web.client.HttpStatusCodeException) {
                org.springframework.web.client.HttpStatusCodeException httpException = (org.springframework.web.client.HttpStatusCodeException) e;
                throw new RuntimeException("Groq API Error: " + httpException.getResponseBodyAsString());
            }
            throw new RuntimeException("Unable to generate recommendation. Please try again. " + e.getMessage());
        }
    }
}
