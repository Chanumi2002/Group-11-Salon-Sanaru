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
import java.util.List;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        // ✅ Completely skip JWT for public endpoints
        List<String> publicPaths = List.of(
                "/api/auth/login",
                "/api/auth/register",
                "/api/auth/register-admin",
                "/api/auth/oauth2",
                "/auth",
                "/api/products",
                "/api/categories",
                "/api/services",
                "/api/reviews",
                "/api/holidays",
                "/health",
                "/uploads",
                "/api/v1/payments/payhere/notify",
                "/api/v1/payments/payhere/cancel");

        boolean isPublic = publicPaths.stream().anyMatch(path::startsWith);

        if (isPublic) {
            chain.doFilter(request, response);
            return;
        }

        final String requestTokenHeader = request.getHeader("Authorization");
        String jwtToken = null;
        String username = null;

        try {
            if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
                jwtToken = requestTokenHeader.substring(7);
                username = jwtUtil.extractUsername(jwtToken);
            }
        } catch (Exception e) {
            logger.debug("Exception parsing token: " + e.getMessage());
            chain.doFilter(request, response);
            return;
        }

        if (jwtToken == null) {
            chain.doFilter(request, response);
            return;
        }

        try {
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                if (jwtUtil.validateToken(jwtToken, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            logger.debug("Exception in token validation: " + e.getMessage());
        }

        chain.doFilter(request, response);
    }
}
