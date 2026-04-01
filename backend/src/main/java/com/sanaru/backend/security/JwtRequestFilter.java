package com.sanaru.backend.security;

import com.sanaru.backend.service.CustomUserDetailsService;
import com.sanaru.backend.util.JwtUtil;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String requestTokenHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;
        boolean hasBearer = false;
        JwtException jwtError = null;

        try {
            if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
                hasBearer = true;
                jwtToken = requestTokenHeader.substring(7);
                
                try {
                    username = jwtUtil.extractUsername(jwtToken);
                } catch (JwtException e) {
                    // Log without exposing details
                    logger.debug("JWT token extraction failed: Invalid or tampered token");
                    jwtError = e;
                    // Store the error to fail authentication
                    username = null;
                }
            }

            if (username != null) {
                try {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                    if (jwtUtil.validateToken(jwtToken, userDetails.getUsername())) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    } else {
                        // Token validation failed (expired, invalid signature, etc.)
                        logger.debug("JWT token validation failed");
                        jwtError = new JwtException("Token validation failed");
                    }
                } catch (UsernameNotFoundException e) {
                    logger.debug("User not found for token");
                    jwtError = new JwtException("User not found");
                } catch (JwtException e) {
                    logger.debug("JWT token validation error: " + e.getMessage());
                    jwtError = e;
                }
            } else if (hasBearer && jwtError == null) {
                // Bearer token was present but could not be processed
                jwtError = new JwtException("Invalid JWT token");
            }

            // If there was a Bearer token but authentication failed, we need to fail the request
            if (hasBearer && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Instead of letting it pass, we should ensure Spring Security rejects it
                // by not setting authentication. The 401 will be handled by JwtAuthenticationEntryPoint
                // for protected resources
                if (jwtError != null) {
                    logger.debug("Bearer token present but invalid: " + jwtError.getMessage());
                }
            }

        } catch (Exception e) {
            logger.debug("Error in JWT filter: Invalid token");
        }

        chain.doFilter(request, response);
    }
}

