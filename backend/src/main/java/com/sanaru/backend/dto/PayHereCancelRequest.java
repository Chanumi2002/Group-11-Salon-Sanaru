package com.sanaru.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayHereCancelRequest {

    @NotBlank(message = "orderReference is required")
    private String orderReference;

    private String reason;
}
