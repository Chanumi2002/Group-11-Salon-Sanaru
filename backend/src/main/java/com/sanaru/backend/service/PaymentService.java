package com.sanaru.backend.service;

import com.sanaru.backend.dto.PayHereCheckoutResponse;

import java.util.Map;

public interface PaymentService {
    PayHereCheckoutResponse preparePayHereCheckout(Long orderId, String userEmail);
    void handlePayHereNotify(Map<String, String> payload);
}