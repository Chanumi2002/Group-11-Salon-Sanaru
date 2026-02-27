package com.sanaru.backend.controller;

import com.sanaru.backend.dto.UserResponse;
import com.sanaru.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    @GetMapping("/customers/count")
    public ResponseEntity<Map<String, Long>> getCustomerCount() {
        long count = userService.getCustomerCount();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/customers")
    public ResponseEntity<List<UserResponse>> getAllCustomers() {
        List<UserResponse> customers = userService.getAllCustomers()
                .stream()
                .map(customer -> customer.toUserResponse())
                .toList();
        return ResponseEntity.ok(customers);
    }

    @PutMapping("/customers/{id}/block")
    public ResponseEntity<?> blockCustomer(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.blockCustomer(id).toUserResponse());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/customers/{id}/unblock")
    public ResponseEntity<?> unblockCustomer(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.unblockCustomer(id).toUserResponse());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/customers/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        try {
            userService.deleteCustomer(id);
            return ResponseEntity.ok(Map.of("message", "Customer deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
