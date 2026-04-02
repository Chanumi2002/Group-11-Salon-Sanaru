package com.sanaru.backend.dto;

import com.sanaru.backend.enums.OrderStatus;
import com.sanaru.backend.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCallbackResponse {

    private boolean processed;
    private boolean confirmedPaid;
    private Long orderId;
    private String orderReference;
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
    private String message;

    public static PaymentCallbackResponse error(String message) {
        return PaymentCallbackResponse.builder()
                .processed(false)
                .confirmedPaid(false)
                .message(message)
                .build();
    }
}
