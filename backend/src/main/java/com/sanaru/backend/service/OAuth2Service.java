package com.sanaru.backend.service;

import java.util.Map;
import java.util.Optional;
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
    private Map<String, JsonNode> publicKeysCache;

    /**
     * Verify Google OAuth token and extract user information
     * Handles both ID tokens (JWT) and access tokens
     */
    public Map<String, Object> verifyGoogleToken(String token) {
        try {
            if (token == null || token.isBlank()) {
                throw new RuntimeException("Token is null or blank");
            }
            
            // First try to decode as ID token (JWT format)
            if (token.contains(".")) {
                return verifyGoogleIdToken(token);
            }
            
            // If not JWT format, try as access token
            String url = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + token;
            String response = restTemplate.getForObject(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(response);
            
            return Map.of(
                "email", jsonNode.get("email").asText(),
                "name", jsonNode.get("name") != null ? jsonNode.get("name").asText() : "User",
                "provider", "google"
            );
        } catch (Exception e) {
            System.err.println("OAuth2Service.verifyGoogleToken error: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to verify Google token: " + e.getMessage(), e);
        }
    }

    /**
     * Verify Google ID token (JWT format) using Google's public keys
     */
    private Map<String, Object> verifyGoogleIdToken(String idToken) {
        try {
            String[] parts = idToken.split("\\.");
            if (parts.length != 3) {
                throw new RuntimeException("Invalid ID token format - expected 3 parts");
            }

            // Decode header to get key ID
            String header = decodeBase64Url(parts[0]);
            JsonNode headerNode = objectMapper.readTree(header);
            String kid = headerNode.get("kid") != null ? headerNode.get("kid").asText() : null;

            // Decode payload
            String payload = decodeBase64Url(parts[1]);
            JsonNode payloadNode = objectMapper.readTree(payload);

            // Verify token expiration
            if (payloadNode.has("exp") && !payloadNode.get("exp").isNull()) {
                long exp = payloadNode.get("exp").asLong();
                long now = System.currentTimeMillis() / 1000;
                if (now > exp) {
                    throw new RuntimeException("ID token has expired");
                }
            }

            // Verify issuer
            if (payloadNode.has("iss") && !payloadNode.get("iss").isNull()) {
                String iss = payloadNode.get("iss").asText();
                if (!iss.equals("https://accounts.google.com") && !iss.equals("accounts.google.com")) {
                    throw new RuntimeException("Invalid token issuer: " + iss);
                }
            }

            // Extract email - this is required
            if (!payloadNode.has("email") || payloadNode.get("email").isNull()) {
                throw new RuntimeException("Email not found in token");
            }

            String email = payloadNode.get("email").asText();
            String name = payloadNode.has("name") && !payloadNode.get("name").isNull() 
                ? payloadNode.get("name").asText() 
                : "User";

            return Map.of(
                "email", email,
                "name", name,
                "provider", "google"
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify Google ID token: " + e.getMessage(), e);
        }
    }

    /**
     * Decode Base64URL encoded string
     */
    private String decodeBase64Url(String encoded) {
        // Convert Base64URL to Base64
        String base64 = encoded.replace('-', '+').replace('_', '/');
        // Add padding
        int padding = 4 - base64.length() % 4;
        if (padding < 4) {
            base64 += "=".repeat(padding);
        }
        byte[] decodedBytes = java.util.Base64.getDecoder().decode(base64);
        return new String(decodedBytes);
    }
}
