package com.sanaru.backend.service;

import com.sanaru.backend.dto.RegisterRequest;
import com.sanaru.backend.model.Role;
import com.sanaru.backend.model.User;
import com.sanaru.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.UUID;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private EmailService emailService;

    public User registerUser(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with email " + request.getEmail() + " already exists");
        }

        // Create new user
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(request.getRole() != null ? request.getRole() : Role.CUSTOMER);
        user.setGender(request.getGender());

        User saved = userRepository.save(user);
        emailService.sendWelcomeEmail(saved.getEmail(), saved.getFirstName());
        return saved;
    }

    public User registerAdminUser(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with email " + request.getEmail() + " already exists");
        }

        // Create new admin user
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(Role.ADMIN);
        user.setGender(request.getGender());

        User saved = userRepository.save(user);
        emailService.sendWelcomeEmail(saved.getEmail(), saved.getFirstName());
        return saved;
    }

    public User authenticateUser(String email, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User updateUser(String email, RegisterRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Update user fields
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setGender(request.getGender());

        return userRepository.save(user);
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        String name = user.getFirstName() + (user.getLastName() != null ? " " + user.getLastName() : "");
        emailService.sendPasswordChangedEmail(user.getEmail(), name);
    }

    public void deleteUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        String userEmail = user.getEmail();
        String name = user.getFirstName() + (user.getLastName() != null ? " " + user.getLastName() : "");
        userRepository.delete(user);
        emailService.sendAccountDeletedEmail(userEmail, name);
    }

    /**
     * Find user by email or create from OAuth (Google/Facebook). New users get a
     * random encoded password.
     */
    public User findOrCreateFromOAuth(String email, String fullName) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required from OAuth provider.");
        }
        return userRepository.findByEmail(email.trim().toLowerCase())
                .orElseGet(() -> {
                    User user = new User();
                    user.setEmail(email.trim().toLowerCase());
                    String name = fullName != null && !fullName.isBlank() ? fullName.trim() : "User";
                    String[] parts = name.split("\\s+", 2);
                    user.setFirstName(parts[0]);
                    user.setLastName(parts.length > 1 ? parts[1] : parts[0]);
                    user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    user.setRole(Role.CUSTOMER);
                    user.setPhone(null);
                    user.setGender(null);
                    return userRepository.save(user);
                });
    }
}
