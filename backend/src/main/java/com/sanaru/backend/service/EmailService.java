package com.sanaru.backend.service;

public interface EmailService {
    // User Account Emails
    void sendWelcomeEmail(String email, String firstName);
    void sendPasswordResetEmail(String email, String resetToken);
    void sendPasswordChangedEmail(String email, String name);
    void sendAccountDeletedEmail(String email, String name);

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
}
