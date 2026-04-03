package com.sanaru.backend.controller;

import com.sanaru.backend.dto.OrderResponse;
import com.sanaru.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
}