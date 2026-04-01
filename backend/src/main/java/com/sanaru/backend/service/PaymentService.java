package com.sanaru.backend.service;

import com.sanaru.backend.dto.PayHereCheckoutResponse;

public interface PaymentService {
    PayHereCheckoutResponse preparePayHereCheckout(Long orderId, String userEmail);
}