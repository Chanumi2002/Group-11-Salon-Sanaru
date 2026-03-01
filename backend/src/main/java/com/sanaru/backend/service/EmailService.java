package com.sanaru.backend.service;

import java.util.concurrent.CompletableFuture;

public interface EmailService {
    // User Account Emails
    void sendWelcomeEmail(String email, String firstName);
    void sendPasswordResetEmail(String email, String resetToken);
    void sendPasswordChangedEmail(String email, String name);
    void sendAccountDeletedEmail(String email, String name);
    void sendAccountBlockedEmail(String email, String name);
    void sendAccountUnblockedEmail(String email, String name);
    void sendBlockedLoginAttemptEmail(String email, String name);

    // Appointment Emails
    void sendAppointmentConfirmationEmail(String toEmail, String customerName, String serviceName,
            String appointmentDate, String appointmentTime, String staffName);
    void sendAppointmentReminderEmail(String toEmail, String customerName, String serviceName,
            String appointmentDate, String appointmentTime);
    void sendAppointmentCancellationEmail(String toEmail, String customerName, String serviceName,
            String appointmentDate, String cancellationReason);

    // Product/Booking Emails
    void sendBookingConfirmationEmail(String toEmail, String customerName, String productName,
            int quantity, double totalPrice, String orderId);

    // Async methods for notifications (non-blocking)
    CompletableFuture<Void> sendPasswordChangedEmailAsync(String email, String name);
    CompletableFuture<Void> sendAccountDeletedEmailAsync(String email, String name);
    CompletableFuture<Void> sendWelcomeEmailAsync(String email, String firstName);
}
