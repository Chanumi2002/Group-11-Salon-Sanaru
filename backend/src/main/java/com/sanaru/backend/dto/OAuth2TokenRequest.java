package com.sanaru.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class OAuth2TokenRequest {
    
    @NotBlank(message = "Token is required")
    private String token;
    
    private String accessToken;

    public OAuth2TokenRequest() {
    }

    public OAuth2TokenRequest(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
}
