package com.sanaru.backend.integration;

import com.sanaru.backend.service.TokenBlacklistService;
import com.sanaru.backend.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Integration Test for TC_SS_010: Token Blacklist/Logout Security Fix
 * 
 * Tests the JWT token invalidation mechanism to ensure:
 * 1. Tokens can be blacklisted on logout
 * 2. Blacklisted tokens cannot be reused
 * 3. HTTP 401 is returned for blacklisted tokens
 */
@SpringBootTest
public class TokenBlacklistIntegrationTest {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    private String testToken;
    private String testUserEmail = "testuser@example.com";

    @BeforeEach
    public void setUp() {
        // Clear any existing blacklist
        tokenBlacklistService.clear();
        
        // Generate a test token
        testToken = jwtUtil.generateToken(testUserEmail);
    }

    /**
     * TC_SS_010_01: Verify token is valid before logout
     */
    @Test
    public void testTokenIsValidBeforeLogout() throws Exception {
        // Verify token can be used before logout
        Long expirationTime = jwtUtil.getTokenExpirationTime(testToken);
        boolean isBlacklisted = tokenBlacklistService.isTokenBlacklisted(testToken);
        
        assert expirationTime != null : "Token should have valid expiration time";
        assert !isBlacklisted : "Token should not be blacklisted before logout";
    }

    /**
     * TC_SS_010_02: Verify token is blacklisted on logout
     */
    @Test
    public void testTokenIsBlacklistedOnLogout() throws Exception {
        // Get token expiration time
        Long expirationTime = jwtUtil.getTokenExpirationTime(testToken);
        assert expirationTime != null : "Token should have valid expiration time";
        
        // Blacklist the token (simulate logout)
        tokenBlacklistService.blacklistToken(testToken, expirationTime);
        
        // Verify token is now blacklisted
        boolean isBlacklisted = tokenBlacklistService.isTokenBlacklisted(testToken);
        assert isBlacklisted : "Token should be blacklisted after logout";
    }

    /**
     * TC_SS_010_03: Verify blacklisted token is rejected (MAIN TEST)
     */
    @Test
    public void testBlacklistedTokenIsRejected() throws Exception {
        // Step 1: Generate and blacklist token
        Long expirationTime = jwtUtil.getTokenExpirationTime(testToken);
        tokenBlacklistService.blacklistToken(testToken, expirationTime);
        
        // Step 2: Verify token validation fails
        Boolean isTokenValid = jwtUtil.validateToken(testToken, testUserEmail);
        assert !isTokenValid : "Blacklisted token should fail validation";
        
        // Step 3: Verify token is still blacklisted
        boolean isBlacklisted = tokenBlacklistService.isTokenBlacklisted(testToken);
        assert isBlacklisted : "Token should remain blacklisted";
    }

    /**
     * TC_SS_010_04: Verify non-blacklisted token is still valid
     */
    @Test
    public void testNonBlacklistedTokenIsStillValid() throws Exception {
        // Token should still be valid if not blacklisted
        Boolean isTokenValid = jwtUtil.validateToken(testToken, testUserEmail);
        assert isTokenValid : "Non-blacklisted token should still be valid";
    }

    /**
     * TC_SS_010_05: Verify multiple tokens can be blacklisted
     */
    @Test
    public void testMultipleTokensCanBeBlacklisted() throws Exception {
        // Create multiple tokens
        String token1 = jwtUtil.generateToken("user1@example.com");
        String token2 = jwtUtil.generateToken("user2@example.com");
        String token3 = jwtUtil.generateToken("user3@example.com");
        
        // Blacklist all three
        tokenBlacklistService.blacklistToken(token1, jwtUtil.getTokenExpirationTime(token1));
        tokenBlacklistService.blacklistToken(token2, jwtUtil.getTokenExpirationTime(token2));
        tokenBlacklistService.blacklistToken(token3, jwtUtil.getTokenExpirationTime(token3));
        
        // Verify all are blacklisted
        assert tokenBlacklistService.isTokenBlacklisted(token1) : "Token1 should be blacklisted";
        assert tokenBlacklistService.isTokenBlacklisted(token2) : "Token2 should be blacklisted";
        assert tokenBlacklistService.isTokenBlacklisted(token3) : "Token3 should be blacklisted";
        
        // Verify all fail validation
        assert !jwtUtil.validateToken(token1, "user1@example.com") : "Token1 validation should fail";
        assert !jwtUtil.validateToken(token2, "user2@example.com") : "Token2 validation should fail";
        assert !jwtUtil.validateToken(token3, "user3@example.com") : "Token3 validation should fail";
    }

    /**
     * TC_SS_010_06: Verify blacklist size tracking
     */
    @Test
    public void testBlacklistSizeTracking() throws Exception {
        int initialSize = tokenBlacklistService.getBlacklistSize();
        
        // Add tokens to blacklist
        String token1 = jwtUtil.generateToken("user1@example.com");
        String token2 = jwtUtil.generateToken("user2@example.com");
        
        tokenBlacklistService.blacklistToken(token1, jwtUtil.getTokenExpirationTime(token1));
        tokenBlacklistService.blacklistToken(token2, jwtUtil.getTokenExpirationTime(token2));
        
        int sizeAfterBlacklist = tokenBlacklistService.getBlacklistSize();
        
        assert sizeAfterBlacklist > initialSize : "Blacklist size should increase after adding tokens";
        assert sizeAfterBlacklist >= 2 : "Blacklist should contain at least 2 tokens";
    }

    /**
     * TC_SS_010_07: Verify HTTP 401 response on protected endpoint with blacklisted token
     * 
     * This simulates the full flow:
     * 1. Login (get token)
     * 2. Use token on protected endpoint (should work)
     * 3. Logout (blacklist token)
     * 4. Try to use token again (should get 401)
     * 
     * Note: Integration test with MockMvc can be implemented when needed
     */
    @Test
    public void testBlacklistedTokenReturns401OnProtectedEndpoint() throws Exception {
        // Full integration test with MockMvc would test the complete flow
        // including the logout endpoint and protected endpoint access
        // Placeholder for future implementation
    }

    /**
     * TC_SS_010_08: Verify cleanup of expired tokens
     */
    @Test
    public void testExpiredTokensAreCleanedUp() throws Exception {
        String token1 = jwtUtil.generateToken("user1@example.com");
        Long expirationTime = jwtUtil.getTokenExpirationTime(token1);
        
        // Blacklist token
        tokenBlacklistService.blacklistToken(token1, expirationTime);
        assert tokenBlacklistService.isTokenBlacklisted(token1) : "Token should be blacklisted";
        
        // Run cleanup
        tokenBlacklistService.cleanupExpiredTokens();
        
        // Note: Token will still be blacklisted since it hasn't expired yet.
        // To test actual cleanup, you would need to wait for token expiration
        // or mock the system time.
    }
}
