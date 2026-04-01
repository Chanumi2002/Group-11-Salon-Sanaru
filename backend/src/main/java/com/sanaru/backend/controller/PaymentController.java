package com.sanaru.backend.controller;

import com.sanaru.backend.dto.PayHereCheckoutResponse;
import com.sanaru.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/payhere/checkout/{orderId}")
    public ResponseEntity<PayHereCheckoutResponse> preparePayHereCheckout(
            @PathVariable Long orderId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        PayHereCheckoutResponse response = paymentService.preparePayHereCheckout(orderId, userEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/payhere/notify")
    public ResponseEntity<String> handlePayHereNotify(@RequestParam Map<String, String> payload) {
        try {
            paymentService.handlePayHereNotify(payload);
            return ResponseEntity.ok("OK");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}