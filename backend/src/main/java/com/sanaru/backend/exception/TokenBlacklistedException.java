package com.sanaru.backend.exception;

/**
 * Exception thrown when a JWT token has been revoked/blacklisted.
 */
public class TokenBlacklistedException extends Exception {
    
    public TokenBlacklistedException(String message) {
        super(message);
    }

    public TokenBlacklistedException(String message, Throwable cause) {
        super(message, cause);
    }
}
