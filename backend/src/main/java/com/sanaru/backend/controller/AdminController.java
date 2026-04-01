package com.sanaru.backend.controller;

import com.sanaru.backend.dto.UserResponse;
import com.sanaru.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers(Authentication authentication) {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/customers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllCustomers(Authentication authentication) {
        return ResponseEntity.ok(userService.getAllCustomers());
    }

    @GetMapping("/customers/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getCustomerCount(Authentication authentication) {
        return ResponseEntity.ok(Map.of("count", userService.getCustomerCount()));
    }

    @PutMapping("/customers/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> blockCustomer(@PathVariable("id") Long customerId, Authentication authentication) {
        try {
            return ResponseEntity.ok(userService.blockCustomer(customerId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/customers/{id}/unblock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> unblockCustomer(@PathVariable("id") Long customerId, Authentication authentication) {
        try {
            return ResponseEntity.ok(userService.unblockCustomer(customerId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/customers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCustomer(@PathVariable("id") Long customerId, Authentication authentication) {
        try {
            userService.deleteCustomer(customerId);
            return ResponseEntity.ok(Map.of("message", "Customer deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
