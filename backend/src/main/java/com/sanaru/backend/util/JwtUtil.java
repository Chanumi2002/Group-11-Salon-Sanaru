package com.sanaru.backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret:mySuperSecretKeyForJWTmySuperSecretKeyForJWT}")
    private String secret;

    @Value("${jwt.expiration:86400}")
    private Long expiration;

    @Autowired(required = false)
    private com.sanaru.backend.service.TokenBlacklistService tokenBlacklistService;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (io.jsonwebtoken.security.SignatureException e) {
            throw new io.jsonwebtoken.JwtException("Invalid JWT signature");
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            throw new io.jsonwebtoken.JwtException("JWT token is expired");
        } catch (io.jsonwebtoken.UnsupportedJwtException e) {
            throw new io.jsonwebtoken.JwtException("Unsupported JWT token");
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            throw new io.jsonwebtoken.JwtException("Invalid JWT token format");
        } catch (IllegalArgumentException e) {
            throw new io.jsonwebtoken.JwtException("JWT token is empty or invalid");
        } catch (Exception e) {
            throw new io.jsonwebtoken.JwtException("JWT token validation failed");
        }
    }

    private Boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            if (expiration == null) {
                return true;  // Consider token expired if no expiration is set
            }
            return expiration.before(new Date());
        } catch (JwtException e) {
            return true;  // Consider token expired on any JWT error
        }
    }

    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        long now = System.currentTimeMillis();
        long expiryTime = now + expiration * 1000;
        
        try {
            var builder = Jwts.builder()
                    .subject(subject)
                    .issuedAt(new Date(now))
                    .expiration(new Date(expiryTime))
                    .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)));
            
            if (claims != null && !claims.isEmpty()) {
                for (Map.Entry<String, Object> entry : claims.entrySet()) {
                    builder.claim(entry.getKey(), entry.getValue());
                }
            }
            
            return builder.compact();
        } catch (Exception e) {
            throw new RuntimeException("JWT token generation failed", e);
        }
    }

    public Boolean validateToken(String token, String username) {
        try {
            // Check if token is blacklisted first
            if (tokenBlacklistService != null && tokenBlacklistService.isTokenBlacklisted(token)) {
                return false;
            }
            
            final String extractedUsername = extractUsername(token);
            return (extractedUsername.equals(username) && !isTokenExpired(token));
        } catch (JwtException e) {
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get the expiration time of a token for blacklisting purposes.
     * 
     * @param token The JWT token
     * @return The expiration time in milliseconds, or null if not available
     */
    public Long getTokenExpirationTime(String token) {
        try {
            Date expiration = extractExpiration(token);
            if (expiration != null) {
                return expiration.getTime();
            }
            return null;
        } catch (JwtException e) {
            return null;
        }
    }
}
