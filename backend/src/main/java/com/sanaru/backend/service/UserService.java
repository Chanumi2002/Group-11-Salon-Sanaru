package com.sanaru.backend.service;

import com.sanaru.backend.dto.RegisterRequest;
import com.sanaru.backend.dto.UpdateProfileRequest;
import com.sanaru.backend.dto.UserResponse;
import com.sanaru.backend.model.Role;
import com.sanaru.backend.model.User;
import com.sanaru.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


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
        // Send welcome email asynchronously - failure won't affect this operation
        emailService.sendWelcomeEmailAsync(saved.getEmail(), saved.getFirstName());
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
        // Send welcome email asynchronously - failure won't affect this operation
        emailService.sendWelcomeEmailAsync(saved.getEmail(), saved.getFirstName());
        return saved;
    }

    public User authenticateUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.getEnabled()) {
            String name = user.getFirstName() + (user.getLastName() != null ? " " + user.getLastName() : "");
            emailService.sendBlockedLoginAttemptEmail(user.getEmail(), name);
            throw new RuntimeException("Your account has been blocked by admin. Attempting to login won't resolve this. Please contact support for assistance.");
        }

        return user;
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

    public User updateUser(String email, UpdateProfileRequest request) {
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
        // Send email asynchronously - failure won't affect this operation
        emailService.sendPasswordChangedEmailAsync(user.getEmail(), name);
    }

    public void deleteUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        String userEmail = user.getEmail();
        String name = user.getFirstName() + (user.getLastName() != null ? " " + user.getLastName() : "");
        userRepository.delete(user);
        // Send email asynchronously - failure won't affect this operation
        emailService.sendAccountDeletedEmailAsync(userEmail, name);
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
                    User saved = userRepository.save(user);
                    // Send welcome email to new OAuth users asynchronously
                    emailService.sendWelcomeEmailAsync(saved.getEmail(), saved.getFirstName());
                    return saved;
                });
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    public List<UserResponse> getAllCustomers() {
        return userRepository.findByRole(Role.CUSTOMER).stream()
                .map(UserResponse::from)
                .toList();
    }

    public Long getCustomerCount() {
        return userRepository.countByRole(Role.CUSTOMER);
    }

    public UserResponse blockCustomer(Long customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));
        if (!user.getRole().equals(Role.CUSTOMER)) {
            throw new RuntimeException("Only customers can be blocked");
        }
        user.setEnabled(false);
        User blocked = userRepository.save(user);
        String name = blocked.getFirstName() + (blocked.getLastName() != null ? " " + blocked.getLastName() : "");
        emailService.sendAccountBlockedEmail(blocked.getEmail(), name);
        return UserResponse.from(blocked);
    }

    public UserResponse unblockCustomer(Long customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));
        if (!user.getRole().equals(Role.CUSTOMER)) {
            throw new RuntimeException("Only customers can be unblocked");
        }
        user.setEnabled(true);
        User unblocked = userRepository.save(user);
        String name = unblocked.getFirstName() + (unblocked.getLastName() != null ? " " + unblocked.getLastName() : "");
        emailService.sendAccountUnblockedEmail(unblocked.getEmail(), name);
        return UserResponse.from(unblocked);
    }

    public void deleteCustomer(Long customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));
        if (!user.getRole().equals(Role.CUSTOMER)) {
            throw new RuntimeException("Only customers can be deleted");
        }
        userRepository.delete(user);
    }
}
