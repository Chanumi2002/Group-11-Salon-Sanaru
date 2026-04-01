package com.sanaru.backend.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class PayHereHashUtil {

    public static String generateHash(
            String merchantId,
            String orderId,
            String amount,
            String currency,
            String merchantSecret
    ) {
        String merchantSecretMd5 = md5(merchantSecret).toUpperCase();
        String raw = merchantId + orderId + amount + currency + merchantSecretMd5;
        return md5(raw).toUpperCase();
    }

    private static String md5(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(value.getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }

            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PayHere hash", e);
        }
    }
}