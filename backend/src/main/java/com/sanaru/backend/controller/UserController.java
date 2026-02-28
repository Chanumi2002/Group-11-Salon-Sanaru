package com.sanaru.backend.controller;

import com.sanaru.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private EmailService emailService;

    /**
     * Health check endpoint for email service
     * Requires JWT authentication
     */
    @GetMapping("/email-health")
    public ResponseEntity<String> emailHealthCheck(Authentication authentication) {
        return ResponseEntity.ok("Email service is available");
    }

    /**
     * Test endpoint to send a welcome email
     * Requires JWT authentication
     */
    @PostMapping("/send-welcome-email")
    public ResponseEntity<String> sendWelcomeEmail(
            @RequestParam String email,
            @RequestParam String name,
            Authentication authentication) {
        try {
            emailService.sendWelcomeEmail(email, name);
            return ResponseEntity.ok("Welcome email sent to: " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }

    /**
     * Test endpoint to send password changed email
     * Requires JWT authentication
     */
    @PostMapping("/send-password-changed-email")
    public ResponseEntity<String> sendPasswordChangedEmail(
            @RequestParam String email,
            @RequestParam String name,
            Authentication authentication) {
        try {
            emailService.sendPasswordChangedEmail(email, name);
            return ResponseEntity.ok("Password changed email sent to: " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }

    /**
     * Test endpoint to send account deleted email
     * Requires JWT authentication
     */
    @PostMapping("/send-account-deleted-email")
    public ResponseEntity<String> sendAccountDeletedEmail(
            @RequestParam String email,
            @RequestParam String name,
            Authentication authentication) {
        try {
            emailService.sendAccountDeletedEmail(email, name);
            return ResponseEntity.ok("Account deleted email sent to: " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }

    /**
     * Test endpoint to send appointment confirmation email
     * Requires JWT authentication
     */
    @PostMapping("/send-appointment-confirmation")
    public ResponseEntity<String> sendAppointmentConfirmation(
            @RequestParam String email,
            @RequestParam String customerName,
            @RequestParam String serviceName,
            @RequestParam String appointmentDate,
            @RequestParam String appointmentTime,
            @RequestParam(required = false) String staffName,
            Authentication authentication) {
        try {
            emailService.sendAppointmentConfirmationEmail(email, customerName, serviceName,
                    appointmentDate, appointmentTime, staffName);
            return ResponseEntity.ok("Appointment confirmation email sent to: " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }

    /**
     * Test endpoint to send appointment reminder email
     * Requires JWT authentication
     */
    @PostMapping("/send-appointment-reminder")
    public ResponseEntity<String> sendAppointmentReminder(
            @RequestParam String email,
            @RequestParam String customerName,
            @RequestParam String serviceName,
            @RequestParam String appointmentDate,
            @RequestParam String appointmentTime,
            Authentication authentication) {
        try {
            emailService.sendAppointmentReminderEmail(email, customerName, serviceName,
                    appointmentDate, appointmentTime);
            return ResponseEntity.ok("Appointment reminder email sent to: " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }

    /**
     * Test endpoint to send appointment cancellation email
     * Requires JWT authentication
     */
    @PostMapping("/send-appointment-cancellation")
    public ResponseEntity<String> sendAppointmentCancellation(
            @RequestParam String email,
            @RequestParam String customerName,
            @RequestParam String serviceName,
            @RequestParam String appointmentDate,
            @RequestParam String cancellationReason,
            Authentication authentication) {
        try {
            emailService.sendAppointmentCancellationEmail(email, customerName, serviceName,
                    appointmentDate, cancellationReason);
            return ResponseEntity.ok("Appointment cancellation email sent to: " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }

    /**
     * Test endpoint to send booking confirmation email
     * Requires JWT authentication
     */
    @PostMapping("/send-booking-confirmation")
    public ResponseEntity<String> sendBookingConfirmation(
            @RequestParam String email,
            @RequestParam String customerName,
            @RequestParam String productName,
            @RequestParam int quantity,
            @RequestParam double totalPrice,
            @RequestParam String orderId,
            Authentication authentication) {
        try {
            emailService.sendBookingConfirmationEmail(email, customerName, productName,
                    quantity, totalPrice, orderId);
            return ResponseEntity.ok("Booking confirmation email sent to: " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }

    /**
     * Test endpoint to send password reset email
     * Requires JWT authentication
     */
    @PostMapping("/send-password-reset")
    public ResponseEntity<String> sendPasswordReset(
            @RequestParam String email,
            @RequestParam String resetToken,
            Authentication authentication) {
        try {
            emailService.sendPasswordResetEmail(email, resetToken);
            return ResponseEntity.ok("Password reset email sent to: " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }
}
