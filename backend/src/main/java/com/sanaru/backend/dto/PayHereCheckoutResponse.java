package com.sanaru.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayHereCheckoutResponse {
    private String action;
    private String method;
    private Map<String, String> fields;
}