package com.sanaru.backend.exception;

/**
 * Custom exception for JWT-related authentication errors
 * Indicates that a JWT token is invalid, tampered, or expired
 */
public class InvalidJwtException extends RuntimeException {
    
    private final String errorCode;
    
    public InvalidJwtException(String message) {
        super(message);
        this.errorCode = "INVALID_JWT";
    }
    
    public InvalidJwtException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public InvalidJwtException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "INVALID_JWT";
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}
