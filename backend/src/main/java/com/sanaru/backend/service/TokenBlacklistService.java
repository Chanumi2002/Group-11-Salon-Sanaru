package com.sanaru.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service to manage JWT token blacklist (token revocation).
 * Maintains a cache of blacklisted tokens with their expiration times.
 * Tokens are automatically considered expired and removed from the cache
 * after their JWT expiration time.
 */
@Service
public class TokenBlacklistService {

    @Value("${jwt.secret:mySuperSecretKeyForJWTmySuperSecretKeyForJWT}")
    private String secret;

    // Thread-safe map storing token JTI (unique identifier) or hash and expiration time
    private final Map<String, Long> blacklistedTokens = new ConcurrentHashMap<>();

    /**
     * Add a token to the blacklist.
     * 
     * @param token The JWT token to blacklist
     * @param expirationTime The expiration time of the token (in milliseconds)
     */
    public void blacklistToken(String token, Long expirationTime) {
        try {
            // Extract the token's JTI (JWT ID) claim if available, otherwise use token hash
            String tokenIdentifier = extractTokenIdentifier(token);
            
            // Store with expiration time
            blacklistedTokens.put(tokenIdentifier, expirationTime);
            
            // Optionally schedule cleanup of expired entries
            cleanupExpiredTokens();
        } catch (Exception e) {
            // If we can't extract JTI, use token hash as fallback
            blacklistedTokens.put(Integer.toString(token.hashCode()), expirationTime);
        }
    }

    /**
     * Check if a token is blacklisted.
     * 
     * @param token The JWT token to check
     * @return true if token is blacklisted and not yet expired, false otherwise
     */
    public boolean isTokenBlacklisted(String token) {
        try {
            String tokenIdentifier = extractTokenIdentifier(token);
            
            if (blacklistedTokens.containsKey(tokenIdentifier)) {
                Long expirationTime = blacklistedTokens.get(tokenIdentifier);
                
                // Check if the token has expired yet
                if (expirationTime != null && new Date().before(new Date(expirationTime))) {
                    // Token is still valid (not yet expired) but blacklisted
                    return true;
                } else {
                    // Token has expired, remove from blacklist
                    blacklistedTokens.remove(tokenIdentifier);
                    return false;
                }
            }
            return false;
        } catch (Exception e) {
            // If we can't extract identifier, check using hash
            String hashKey = Integer.toString(token.hashCode());
            if (blacklistedTokens.containsKey(hashKey)) {
                Long expirationTime = blacklistedTokens.get(hashKey);
                if (expirationTime != null && new Date().before(new Date(expirationTime))) {
                    return true;
                } else {
                    blacklistedTokens.remove(hashKey);
                    return false;
                }
            }
            return false;
        }
    }

    /**
     * Extract the token identifier (JTI claim) from a JWT token.
     * If JTI is not available, generates a hash-based identifier.
     * 
     * @param token The JWT token
     * @return The token identifier
     */
    private String extractTokenIdentifier(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            // Try to get JTI (JWT ID) claim
            String jti = claims.getId();
            if (jti != null && !jti.isEmpty()) {
                return jti;
            }
            
            // If JTI not available, use subject + issuedAt as identifier
            String subject = claims.getSubject();
            Date issuedAt = claims.getIssuedAt();
            if (subject != null && issuedAt != null) {
                return subject + ":" + issuedAt.getTime();
            }
            
            // Fallback: use token hash
            return Integer.toString(token.hashCode());
        } catch (Exception e) {
            // Fallback to token hash if parsing fails
            return Integer.toString(token.hashCode());
        }
    }

    /**
     * Clean up expired tokens from the blacklist.
     * This method removes tokens that have passed their expiration time.
     */
    public void cleanupExpiredTokens() {
        long now = System.currentTimeMillis();
        blacklistedTokens.entrySet().removeIf(entry -> 
            entry.getValue() != null && entry.getValue() < now
        );
    }

    /**
     * Get the current size of the blacklist (for monitoring/debugging).
     * 
     * @return Number of tokens in the blacklist
     */
    public int getBlacklistSize() {
        cleanupExpiredTokens();
        return blacklistedTokens.size();
    }

    /**
     * Clear all blacklisted tokens (use with caution - typically for testing).
     */
    public void clear() {
        blacklistedTokens.clear();
    }
}
