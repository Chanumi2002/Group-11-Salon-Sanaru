package com.sanaru.backend.controller;

import com.sanaru.backend.dto.OrderResponse;
import com.sanaru.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}