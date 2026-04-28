package com.sanaru.backend.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Filter to add Cross-Origin-Opener-Policy header for OAuth popup support
 * This allows the OAuth popup to communicate with the parent window via postMessage
 */
@Component
public class CookiePolicyFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        if (response instanceof HttpServletResponse httpResponse) {
            // Allow OAuth popup to communicate with parent window
            // same-origin-allow-popups: allows this page to open popups and those popups to communicate back
            httpResponse.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
            
            // Do NOT set Cross-Origin-Embedder-Policy as it's too restrictive
            // It would require all resources to declare CORS headers
            
            // Additional security headers
            httpResponse.setHeader("X-Content-Type-Options", "nosniff");
            httpResponse.setHeader("X-Frame-Options", "SAMEORIGIN");
        }
        
        chain.doFilter(request, response);
    }
}
