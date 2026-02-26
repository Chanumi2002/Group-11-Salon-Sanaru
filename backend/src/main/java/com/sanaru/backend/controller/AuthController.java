package com.sanaru.backend.controller;

import com.sanaru.backend.dto.AuthRequest;
import com.sanaru.backend.dto.AuthResponse;
import com.sanaru.backend.dto.ChangePasswordRequest;
import com.sanaru.backend.dto.RegisterRequest;
import com.sanaru.backend.dto.UserResponse;
import com.sanaru.backend.model.User;
import com.sanaru.backend.service.UserService;
import com.sanaru.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${admin.registration.secret:AdminSecretKey2026}")
    private String adminSecret;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
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
    public ResponseEntity<AuthResponse> registerAdmin(@RequestBody RegisterRequest request,
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
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
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
            return ResponseEntity.badRequest().body(new AuthResponse(null, e.getMessage()));
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
    public ResponseEntity<UserResponse> updateProfile(@RequestBody RegisterRequest request,
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
    public ResponseEntity<AuthResponse> changePassword(@RequestBody ChangePasswordRequest request,
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
}
