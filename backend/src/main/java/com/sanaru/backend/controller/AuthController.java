package com.sanaru.backend.controller;

import com.sanaru.backend.dto.AuthRequest;
import com.sanaru.backend.dto.AuthResponse;
import com.sanaru.backend.dto.ChangePasswordRequest;
import com.sanaru.backend.dto.OAuth2TokenRequest;
import com.sanaru.backend.dto.RegisterRequest;
import com.sanaru.backend.dto.UserResponse;
import com.sanaru.backend.model.User;
import com.sanaru.backend.service.UserService;
import com.sanaru.backend.service.OAuth2Service;
import com.sanaru.backend.service.TokenBlacklistService;
import com.sanaru.backend.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OAuth2Service oAuth2Service;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Value("${admin.registration.secret:AdminSecretKey2026}")
    private String adminSecret;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request);
            String token = jwtUtil.generateToken(user.getEmail());
            AuthResponse response = new AuthResponse(token, "User registered successfully");
            if (user.getGender() != null) {
                response.setGender(user.getGender().name());
            }
            if (user.getRole() != null) {
                response.setRole(user.getRole().name());
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, e.getMessage()));
        }
    }

    @PostMapping("/register-admin")
    public ResponseEntity<AuthResponse> registerAdmin(@Valid @RequestBody RegisterRequest request,
            @RequestParam String secret) {
        try {
            // Verify admin secret
            if (!secret.equals(adminSecret)) {
                return ResponseEntity.status(403)
                        .body(new AuthResponse(null, "Invalid admin registration secret"));
            }

            User user = userService.registerAdminUser(request);
            String token = jwtUtil.generateToken(user.getEmail());
            AuthResponse response = new AuthResponse(token, "Admin registered successfully");
            if (user.getGender() != null) {
                response.setGender(user.getGender().name());
            }
            if (user.getRole() != null) {
                response.setRole(user.getRole().name());
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        try {
            User user = userService.authenticateUser(request.getEmail(), request.getPassword());
            String token = jwtUtil.generateToken(user.getEmail());
            AuthResponse response = new AuthResponse(token, "Login successful");
            if (user.getGender() != null) {
                response.setGender(user.getGender().name());
            }
            if (user.getRole() != null) {
                response.setRole(user.getRole().name());
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(null, e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUserByEmail(email);
            return ResponseEntity.ok(user.toUserResponse());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody RegisterRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.updateUser(email, request);
            return ResponseEntity.ok(user.toUserResponse());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<AuthResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            userService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(new AuthResponse(null, "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, e.getMessage()));
        }
    }

    @DeleteMapping("/profile")
    public ResponseEntity<AuthResponse> deleteProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            userService.deleteUserByEmail(email);
            return ResponseEntity.ok(new AuthResponse(null, "Account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, e.getMessage()));
        }
    }

    /**
     * OAuth2: Verify Google token and create/login user
     */
    @PostMapping("/oauth2/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody OAuth2TokenRequest request) {
        try {
            // Verify the token with Google
            Map<String, Object> userInfo = oAuth2Service.verifyGoogleToken(request.getToken());
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");

            // Find or create user
            User user = userService.findOrCreateFromOAuth(email, name);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail());
            
            // Create response
            AuthResponse response = new AuthResponse(token, "Google login successful");
            if (user.getGender() != null) {
                response.setGender(user.getGender().name());
            }
            if (user.getRole() != null) {
                response.setRole(user.getRole().name());
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(new AuthResponse(null, "Google authentication failed: " + e.getMessage()));
        }
    }

    /**
     * Logout: Invalidate the JWT token by adding it to the blacklist.
     * The token remains valid until its expiration time, but users cannot use it
     * after logout. Future requests with this token will be rejected.
     * 
     * @param request The HTTP request containing the Authorization header with the JWT token
     * @param authentication The authenticated user's information
     * @return Response indicating successful logout
     */
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(
            org.springframework.web.context.request.RequestAttributes request,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.badRequest()
                        .body(new AuthResponse(null, "No user is currently logged in"));
            }

            // Get token from Authorization header
            org.springframework.web.context.request.ServletRequestAttributes servletAttributes =
                    (org.springframework.web.context.request.ServletRequestAttributes) request;
            String authHeader = servletAttributes.getRequest().getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                
                // Add token to blacklist with its expiration time
                Long expirationTime = jwtUtil.getTokenExpirationTime(token);
                if (expirationTime != null) {
                    tokenBlacklistService.blacklistToken(token, expirationTime);
                    return ResponseEntity.ok(new AuthResponse(null, "Logout successful. Token has been revoked."));
                } else {
                    return ResponseEntity.badRequest()
                            .body(new AuthResponse(null, "Could not determine token expiration time"));
                }
            }

            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, "Token not found in Authorization header"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(null, "Logout failed: " + e.getMessage()));
        }
    }


}
