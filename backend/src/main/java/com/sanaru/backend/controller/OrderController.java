package com.sanaru.backend.controller;

import com.sanaru.backend.dto.OrderResponse;
import com.sanaru.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public OrderResponse checkout() {
        return orderService.checkout();
    }

    @GetMapping("/history")
    public List<OrderResponse> getMyOrders() {
        return orderService.getMyOrders();
    }

    @GetMapping("/reference/{orderReference}")
    public OrderResponse getMyOrderByReference(@PathVariable String orderReference) {
        return orderService.getMyOrderByReference(orderReference);
    }

    /**
     * Story 5 – Customer requests cancellation of any non-terminal order.
     * PUT /api/orders/{orderId}/cancel-request
     */
    @PutMapping("/{orderId}/cancel-request")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> requestCancellation(@PathVariable Long orderId) {
        try {
            return ResponseEntity.ok(orderService.requestCancellation(orderId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/pending-approval-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getPendingApprovalCount() {
        long count = orderService.getPendingApprovalOrderCount();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/my-status-counts")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Integer>> getMyStatusCounts(
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Integer> counts = orderService.getCustomerOrderStatusCounts(userDetails.getUsername());
        return ResponseEntity.ok(counts);
    }

    /**
     * Admin: Update order delivery status
     * PUT /api/orders/{orderId}/delivery-status
     */
    @PutMapping("/{orderId}/delivery-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateDeliveryStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            if (newStatus == null || newStatus.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));
            }
            OrderResponse response = orderService.updateDeliveryStatus(orderId, newStatus);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Customer: Mark order as received (delivered)
     * PUT /api/orders/{orderId}/mark-received
     */
    @PutMapping("/{orderId}/mark-received")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> markOrderAsReceived(@PathVariable Long orderId) {
        try {
            OrderResponse response = orderService.markOrderAsReceived(orderId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
}
