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

    // Payment Emails
    void sendPaymentSuccessEmail(String toEmail, String customerName, String orderId, double amount, String paymentMethod);
    void sendPaymentFailureEmail(String toEmail, String customerName, String orderId, String reason);
    void sendRefundConfirmationEmail(String toEmail, String customerName, String orderId, double refundAmount);
    void sendAdminPaymentNotification(String merchantReference, double amount, String status, String paymentMethod);
    
    // Order Status Update Emails
    void sendOrderStatusUpdateEmail(String toEmail, String customerName, String orderId, String newStatus);
    void sendOrderCancellationConfirmationEmail(String toEmail, String customerName, String orderId, double refundAmount);

    // Service Booking Emails
    void sendServiceBookingConfirmationEmail(String toEmail, String customerName, String serviceName, double price, String bookingReference);
    void sendRefundRequestNotificationEmail(String toEmail, String customerName, String orderId, double refundAmount, String reason);
    
    // Future appointment reminder emails (to be implemented)
    // void sendAppointmentReminderEmail(String toEmail, String appointmentDate, String appointmentTime);

    // Feedback/Review Emails
    void sendReviewNotificationToAdmin(com.sanaru.backend.dto.FeedbackResponse feedback);

    // Async methods for notifications (non-blocking)
    CompletableFuture<Void> sendPasswordChangedEmailAsync(String email, String name);
    CompletableFuture<Void> sendAccountDeletedEmailAsync(String email, String name);
    CompletableFuture<Void> sendWelcomeEmailAsync(String email, String firstName);
}
