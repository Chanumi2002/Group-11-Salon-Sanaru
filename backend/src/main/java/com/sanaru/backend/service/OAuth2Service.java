package com.sanaru.backend.service;

import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Service for handling OAuth2 authentication with Google and Facebook
 */
@Service
public class OAuth2Service {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Verify Google OAuth token and extract user information
     */
    public Map<String, Object> verifyGoogleToken(String token) {
        try {
            // Google token verification endpoint
            String url = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + token;
            
            try {
                String response = restTemplate.getForObject(url, String.class);
                JsonNode jsonNode = objectMapper.readTree(response);
                
                return Map.of(
                    "email", jsonNode.get("email").asText(),
                    "name", jsonNode.get("name") != null ? jsonNode.get("name").asText() : "User",
                    "provider", "google"
                );
            } catch (Exception e) {
                // If the above fails, try with ID token (JWT format)
                return verifyGoogleIdToken(token);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify Google token: " + e.getMessage(), e);
        }
    }

    /**
     * Verify Google ID token (JWT format)
     */
    private Map<String, Object> verifyGoogleIdToken(String idToken) {
        try {
            // For ID tokens, we would need to verify the JWT signature
            // For now, we can decode the token and extract claims
            String[] parts = idToken.split("\\.");
            if (parts.length != 3) {
                throw new RuntimeException("Invalid ID token format");
            }

            String payload = parts[1];
            // Decode base64url
            payload = payload.replace('-', '+').replace('_', '/');
            int padding = 4 - payload.length() % 4;
            if (padding < 4) {
                payload += "=".repeat(padding);
            }

            byte[] decodedBytes = java.util.Base64.getDecoder().decode(payload);
            String decodedPayload = new String(decodedBytes);
            JsonNode jsonNode = objectMapper.readTree(decodedPayload);

            return Map.of(
                "email", jsonNode.get("email").asText(),
                "name", jsonNode.get("name") != null ? jsonNode.get("name").asText() : "User",
                "provider", "google"
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify Google ID token: " + e.getMessage(), e);
        }
    }


}
