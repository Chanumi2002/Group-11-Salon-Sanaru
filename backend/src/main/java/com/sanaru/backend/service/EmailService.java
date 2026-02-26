package com.sanaru.backend.service;

public interface EmailService {
    void sendWelcomeEmail(String email, String firstName);
    void sendPasswordResetEmail(String email, String resetToken);
    void sendPasswordChangedEmail(String email, String name);
    void sendAccountDeletedEmail(String email, String name);
}
