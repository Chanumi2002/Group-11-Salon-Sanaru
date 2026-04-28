package com.sanaru.backend.config;

import com.sanaru.backend.security.JwtAuthenticationEntryPoint;
import com.sanaru.backend.security.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired(required = false)
    @Lazy
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @Autowired(required = false)
    private ClientRegistrationRepository clientRegistrationRepository;

    @Bean
    public JwtAuthenticationEntryPoint unauthorizedHandler() {
        return new JwtAuthenticationEntryPoint();
    }

    @Bean
    public com.sanaru.backend.security.JwtAccessDeniedHandler accessDeniedHandler() {
        return new com.sanaru.backend.security.JwtAccessDeniedHandler();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtRequestFilter authenticationTokenFilterBean() {
        return new JwtRequestFilter();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        // Expose Authorization header for token
        configuration.setExposedHeaders(List.of("Authorization", "X-Content-Type-Options"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        // First, explicitly require auth for these specific auth endpoints
                        .requestMatchers("/api/auth/profile", "/api/auth/change-password", "/api/auth/logout")
                        .authenticated()
                        // Public auth endpoints (broader patterns for all auth variants)
                        .requestMatchers(
                                "/health",
                                "/v1/auth/**",
                                "/api/v1/auth/**",
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/register-admin",
                                "/api/auth/oauth2/**",
                                "/auth/**",
                                "/oauth2/**",
                                "/login/oauth2/**",
                                "/error")
                        .permitAll()
                        // Public endpoints for customers / guests
                        .requestMatchers("/api/products/**", "/api/categories/**", "/api/services/**",
                                "/api/reviews/**", "/uploads/**")
                        .permitAll()
                        // Public read-only endpoints for closed dates (write operations secured by
                        // @PreAuthorize)
                        .requestMatchers("/api/closed-dates/**").permitAll()
                        // Public holidays endpoint for appointment booking
                        .requestMatchers("/api/holidays/**").permitAll()
                        // Public holiday override read endpoints for appointment booking
                        .requestMatchers("/api/holiday-overrides/by-date", "/api/holiday-overrides/working-dates",
                                "/api/holiday-overrides/is-working-date", "/api/holiday-overrides/custom-hours")
                        .permitAll()
                        // Public payment provider callback endpoint
                        .requestMatchers("/api/v1/payments/payhere/notify", "/api/v1/payments/payhere/cancel")
                        .permitAll()
                        // Authenticated endpoints removed from here as they are at the top
                        // Admin endpoints
                        .requestMatchers("/api/admin/**").permitAll()
                        // Any other request must be authenticated
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(unauthorizedHandler())
                        .accessDeniedHandler(accessDeniedHandler()))
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        if (clientRegistrationRepository != null && oAuth2LoginSuccessHandler != null) {
            http.oauth2Login(oauth2 -> oauth2.successHandler(oAuth2LoginSuccessHandler));
        }

        http.addFilterBefore(authenticationTokenFilterBean(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
