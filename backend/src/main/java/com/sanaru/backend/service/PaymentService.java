package com.sanaru.backend.service;

import com.sanaru.backend.dto.PayHereCancelRequest;
import com.sanaru.backend.dto.PaymentCallbackResponse;
import com.sanaru.backend.dto.PayHereCheckoutResponse;

import java.util.Map;

public interface PaymentService {
    PayHereCheckoutResponse preparePayHereCheckout(Long orderId, String userEmail);
    PaymentCallbackResponse handlePayHereNotify(Map<String, String> payload);
    PaymentCallbackResponse handlePayHereCancel(PayHereCancelRequest request);
}