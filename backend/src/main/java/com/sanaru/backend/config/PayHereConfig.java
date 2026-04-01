package com.sanaru.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "payhere")
@Getter
@Setter
public class PayHereConfig {
    private String merchantId;
    private String merchantSecret;
    private String checkoutUrl;
    private String currency;
    private String returnUrl;
    private String cancelUrl;
    private String notifyUrl;
}