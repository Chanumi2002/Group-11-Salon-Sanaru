package com.sanaru.backend.controller;

import com.sanaru.backend.dto.PayHereCancelRequest;
import com.sanaru.backend.dto.PaymentCallbackResponse;
import com.sanaru.backend.dto.PayHereCheckoutResponse;
import com.sanaru.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
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
    public ResponseEntity<PaymentCallbackResponse> handlePayHereNotify(@RequestParam Map<String, String> payload) {
        try {
            return ResponseEntity.ok(paymentService.handlePayHereNotify(payload));
        } catch (IllegalArgumentException e) {
            log.warn("PayHere notify rejected: {}", e.getMessage());
            return ResponseEntity.badRequest().body(PaymentCallbackResponse.error(e.getMessage()));
        } catch (RuntimeException e) {
            log.error("PayHere notify failed unexpectedly", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(PaymentCallbackResponse.error("Failed to process payment notification"));
        }
    }

    @PostMapping("/payhere/cancel")
    public ResponseEntity<PaymentCallbackResponse> handlePayHereCancel(@Valid @RequestBody PayHereCancelRequest request) {
        try {
            return ResponseEntity.ok(paymentService.handlePayHereCancel(request));
        } catch (IllegalArgumentException e) {
            log.warn("PayHere cancel rejected: {}", e.getMessage());
            return ResponseEntity.badRequest().body(PaymentCallbackResponse.error(e.getMessage()));
        } catch (RuntimeException e) {
            log.error("PayHere cancel failed unexpectedly", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(PaymentCallbackResponse.error("Failed to process cancellation"));
        }
    }
}