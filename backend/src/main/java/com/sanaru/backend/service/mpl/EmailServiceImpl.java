package com.sanaru.backend.service.mpl;

import com.sanaru.backend.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.UnsupportedEncodingException;
import java.util.concurrent.CompletableFuture;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${app.mail.from-email:salonsanaru28@gmail.com}")
    private String fromEmail;

    @Value("${app.mail.from-name:Salon Sanaru}")
    private String fromName;

    @Value("${app.mail.support-email:support@sanaru.com}")
    private String supportEmail;

    @Override
    public void sendWelcomeEmail(String email, String firstName) {
        try {
            String subject = "Welcome to Salon Sanaru! 💅";
            String htmlContent = buildWelcomeEmailHtml(firstName);
            sendHtmlEmail(email, subject, htmlContent);
            logger.info("Welcome email sent successfully to: " + email);
        } catch (Exception e) {
            logger.error("Failed to send welcome email to " + email, e);
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }

    @Override
    public void sendPasswordResetEmail(String email, String resetToken) {
        try {
            String subject = "Reset Your Salon Sanaru Password";
            String htmlContent = buildPasswordResetEmailHtml(resetToken);
            sendHtmlEmail(email, subject, htmlContent);
            logger.info("Password reset email sent successfully to: " + email);
        } catch (Exception e) {
            logger.error("Failed to send password reset email to " + email, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    @Override
    public void sendPasswordChangedEmail(String email, String name) {
        try {
            String subject = "Your Password Has Been Changed - Salon Sanaru";
            String htmlContent = buildPasswordChangedEmailHtml(name);
            sendHtmlEmail(email, subject, htmlContent);
            logger.info("Password changed email sent successfully to: " + email);
        } catch (Exception e) {
            logger.error("Failed to send password changed email to " + email, e);
            throw new RuntimeException("Failed to send password changed email", e);
        }
    }

    @Override
    public void sendAccountDeletedEmail(String email, String name) {
        try {
            String subject = "Your Salon Sanaru Account Has Been Deleted";
            String htmlContent = buildAccountDeletedEmailHtml(name);
            sendHtmlEmail(email, subject, htmlContent);
            logger.info("Account deleted email sent successfully to: " + email);
        } catch (Exception e) {
            logger.error("Failed to send account deleted email to " + email, e);
            throw new RuntimeException("Failed to send account deleted email", e);
        }
    }

    @Override
    public void sendAccountBlockedEmail(String email, String name) {
        try {
            String subject = "Your Salon Sanaru Account Has Been Blocked";
            String htmlContent = buildAccountBlockedEmailHtml(name);
            sendHtmlEmail(email, subject, htmlContent);
            logger.info("Account blocked email sent successfully to: " + email);
        } catch (Exception e) {
            logger.error("Failed to send account blocked email to " + email, e);
            throw new RuntimeException("Failed to send account blocked email", e);
        }
    }

    @Override
    public void sendAccountUnblockedEmail(String email, String name) {
        try {
            String subject = "Your Salon Sanaru Account Has Been Unblocked";
            String htmlContent = buildAccountUnblockedEmailHtml(name);
            sendHtmlEmail(email, subject, htmlContent);
            logger.info("Account unblocked email sent successfully to: " + email);
        } catch (Exception e) {
            logger.error("Failed to send account unblocked email to " + email, e);
            throw new RuntimeException("Failed to send account unblocked email", e);
        }
    }

    @Override
    public void sendBlockedLoginAttemptEmail(String email, String name) {
        try {
            String subject = "Login Attempt on Your Blocked Account - Salon Sanaru";
            String htmlContent = buildBlockedLoginAttemptEmailHtml(name);
            sendHtmlEmail(email, subject, htmlContent);
            logger.info("Blocked login attempt reminder email sent successfully to: " + email);
        } catch (Exception e) {
            logger.error("Failed to send blocked login attempt email to " + email, e);
            throw new RuntimeException("Failed to send blocked login attempt email", e);
        }
    }

    @Override
    public void sendAppointmentConfirmationEmail(String toEmail, String customerName, String serviceName,
            String appointmentDate, String appointmentTime, String staffName) {
        try {
            String subject = "Appointment Confirmed - Salon Sanaru 📅";
            String htmlContent = buildAppointmentConfirmationHtml(customerName, serviceName,
                    appointmentDate, appointmentTime, staffName);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Appointment confirmation email sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send appointment confirmation email to " + toEmail, e);
            throw new RuntimeException("Failed to send appointment confirmation email", e);
        }
    }

    @Override
    public void sendAppointmentReminderEmail(String toEmail, String customerName, String serviceName,
            String appointmentDate, String appointmentTime) {
        try {
            String subject = "Reminder: Your Appointment Tomorrow - Salon Sanaru 🔔";
            String htmlContent = buildAppointmentReminderHtml(customerName, serviceName,
                    appointmentDate, appointmentTime);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Appointment reminder email sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send appointment reminder email to " + toEmail, e);
            throw new RuntimeException("Failed to send appointment reminder email", e);
        }
    }

    @Override
    public void sendAppointmentCancellationEmail(String toEmail, String customerName, String serviceName,
            String appointmentDate, String cancellationReason) {
        try {
            String subject = "Appointment Cancelled - Salon Sanaru ❌";
            String htmlContent = buildAppointmentCancellationHtml(customerName, serviceName,
                    appointmentDate, cancellationReason);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Appointment cancellation email sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send appointment cancellation email to " + toEmail, e);
            throw new RuntimeException("Failed to send appointment cancellation email", e);
        }
    }

    @Override
    public void sendBookingConfirmationEmail(String toEmail, String customerName, String productName,
            int quantity, double totalPrice, String orderId) {
        try {
            String subject = "Order Confirmed - Salon Sanaru 🛍️";
            String htmlContent = buildBookingConfirmationHtml(customerName, productName, quantity,
                    totalPrice, orderId);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Booking confirmation email sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send booking confirmation email to " + toEmail, e);
            throw new RuntimeException("Failed to send booking confirmation email", e);
        }
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlContent)
            throws MessagingException {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        try {
            helper.setFrom(fromEmail, fromName);
        } catch (UnsupportedEncodingException e) {
            helper.setFrom(fromEmail);
        }
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        javaMailSender.send(mimeMessage);
    }

    private String buildWelcomeEmailHtml(String firstName) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<div style=\"text-align: center; margin-bottom: 30px;\">"
                + "<h1 style=\"color: #d946a6; margin: 0;\">Welcome to Salon Sanaru! 💅</h1>"
                + "</div>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hi " + firstName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Welcome to Salon Sanaru, your premier destination for beauty and wellness services. We're thrilled to have you join our community!</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">With your account, you can:</p>"
                + "<ul style=\"font-size: 16px; line-height: 1.8;\">"
                + "<li>Book appointments with our expert stylists</li>"
                + "<li>Explore our premium beauty products and services</li>"
                + "<li>Track your bookings and appointments</li>"
                + "<li>Receive personalized beauty recommendations</li>"
                + "</ul>"
                + "<div style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000\" style=\"background-color: #d946a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">Start Booking Now</a>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #666; line-height: 1.6;\">If you have any questions, feel free to reach out to us at <a href=\"mailto:" + supportEmail + "\">" + supportEmail + "</a></p>"
                + "<hr style=\"border: none; border-top: 1px solid #ddd; margin: 20px 0;\">"
                + "<p style=\"font-size: 12px; color: #999; text-align: center;\">Salon Sanaru | Beauty & Wellness</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildPasswordResetEmailHtml(String resetToken) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #d946a6;\">Password Reset Request</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">We received a request to reset your password. Click the link below to proceed:</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/reset-password?token=" + resetToken + "\" style=\"background-color: #d946a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">Reset Password</a>"
                + "</p>"
                + "<p style=\"font-size: 14px; color: #666;\">This link will expire in 24 hours for security purposes.</p>"
                + "<p style=\"font-size: 14px; color: #666;\">If you didn't request this, please ignore this email.</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildPasswordChangedEmailHtml(String name) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #d946a6;\">Password Changed Successfully</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hi " + name + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Your password has been successfully changed.</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\"><strong>⚠️ Security Notice:</strong> If you didn't make this change, please contact us immediately at <a href=\"mailto:" + supportEmail + "\">" + supportEmail + "</a></p>"
                + "<p style=\"font-size: 14px; color: #666;\">For your security, never share your password with anyone.</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildAccountDeletedEmailHtml(String name) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #d946a6;\">Account Deleted</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hi " + name + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Your Salon Sanaru account has been successfully deleted.</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">We'll miss you! If you change your mind, you can always create a new account.</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6; text-align: center;\">"
                + "<a href=\"http://localhost:3000/register\" style=\"color: #d946a6; text-decoration: none; font-weight: bold;\">Create New Account</a>"
                + "</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildAccountBlockedEmailHtml(String name) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #d946a6;\">Account Blocked</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hi " + name + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Your Salon Sanaru account has been temporarily blocked by our administration team.</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">If you believe this is a mistake, please contact us at <a href=\"mailto:" + supportEmail + "\">" + supportEmail + "</a> to appeal.</p>"
                + "<p style=\"font-size: 14px; color: #666;\">" + supportEmail + "</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildAccountUnblockedEmailHtml(String name) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #d946a6;\">Account Unblocked</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hi " + name + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Good news! Your Salon Sanaru account has been unblocked and is now active again.</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">You can now log in and continue booking your favorite services.</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/login\" style=\"background-color: #d946a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">Log In Now</a>"
                + "</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildBlockedLoginAttemptEmailHtml(String name) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #d946a6;\">🔒 Login Attempt on Blocked Account</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hi " + name + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">We noticed that someone tried to log into your Salon Sanaru account, but your account is currently blocked.</p>"
                + "<div style=\"background-color: #fef2f2; border-left: 4px solid #d946a6; padding: 15px; margin: 20px 0; border-radius: 5px;\">"
                + "<p style=\"font-size: 16px; line-height: 1.6;\"><strong>⚠️ Your account is blocked</strong></p>"
                + "<p style=\"font-size: 14px; line-height: 1.6; margin: 10px 0 0 0;\">If you didn't attempt this login or believe this is a mistake, please contact our support team.</p>"
                + "</div>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">For assistance or to appeal the account restriction, please contact us at <a href=\"mailto:" + supportEmail + "\" style=\"color: #d946a6; text-decoration: none;\">" + supportEmail + "</a></p>"
                + "<p style=\"font-size: 14px; color: #666; margin-top: 30px;\"><strong>Support Email:</strong> " + supportEmail + "</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildAppointmentConfirmationHtml(String customerName, String serviceName,
            String appointmentDate, String appointmentTime, String staffName) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #d946a6;\">Appointment Confirmed! 📅</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hi " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Your appointment has been successfully confirmed!</p>"
                + "<div style=\"background-color: #f9f0f6; padding: 20px; border-radius: 5px; margin: 20px 0;\">"
                + "<p><strong>Service:</strong> " + serviceName + "</p>"
                + "<p><strong>Date:</strong> " + appointmentDate + "</p>"
                + "<p><strong>Time:</strong> " + appointmentTime + "</p>"
                + (staffName != null ? "<p><strong>Stylist:</strong> " + staffName + "</p>" : "")
                + "</div>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\"><strong>Please arrive 10 minutes early!</strong></p>"
                + "<p style=\"font-size: 14px; color: #666;\">If you need to reschedule or cancel, please contact us as soon as possible.</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/dashboard\" style=\"background-color: #d946a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">View My Bookings</a>"
                + "</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildAppointmentReminderHtml(String customerName, String serviceName,
            String appointmentDate, String appointmentTime) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #d946a6;\">Appointment Reminder 🔔</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hi " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">This is a friendly reminder that you have an appointment tomorrow!</p>"
                + "<div style=\"background-color: #f9f0f6; padding: 20px; border-radius: 5px; margin: 20px 0;\">"
                + "<p><strong>Service:</strong> " + serviceName + "</p>"
                + "<p><strong>Date:</strong> " + appointmentDate + "</p>"
                + "<p><strong>Time:</strong> " + appointmentTime + "</p>"
                + "</div>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\"><strong>Please arrive 10 minutes early!</strong></p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildAppointmentCancellationHtml(String customerName, String serviceName,
            String appointmentDate, String cancellationReason) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #d946a6;\">Appointment Cancelled ❌</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hi " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Your appointment has been cancelled.</p>"
                + "<div style=\"background-color: #f9f0f6; padding: 20px; border-radius: 5px; margin: 20px 0;\">"
                + "<p><strong>Service:</strong> " + serviceName + "</p>"
                + "<p><strong>Date:</strong> " + appointmentDate + "</p>"
                + "<p><strong>Reason:</strong> " + cancellationReason + "</p>"
                + "</div>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">We're sorry to hear that! Feel free to book another appointment anytime.</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/dashboard\" style=\"background-color: #d946a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">Book Another Appointment</a>"
                + "</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildBookingConfirmationHtml(String customerName, String productName, int quantity,
            double totalPrice, String orderId) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #d946a6;\">Order Confirmed! 🛍️</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hi " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Thank you for your order! Your purchase has been confirmed.</p>"
                + "<div style=\"background-color: #f9f0f6; padding: 20px; border-radius: 5px; margin: 20px 0;\">"
                + "<p><strong>Order ID:</strong> " + orderId + "</p>"
                + "<p><strong>Product:</strong> " + productName + "</p>"
                + "<p><strong>Quantity:</strong> " + quantity + "</p>"
                + "<p style=\"font-size: 18px; color: #d946a6;\"><strong>Total Price: $" + String.format("%.2f", totalPrice) + "</strong></p>"
                + "</div>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Your order is being prepared and will be shipped soon. You'll receive a tracking number via email.</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/orders\" style=\"background-color: #d946a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">Track My Order</a>"
                + "</p>"
                + "</div>"
                + "</body></html>";
    }

    /**
     * Async method to send password changed email without blocking the main thread
     * Failures are logged but do not affect the main operation
     */
    @Override
    @Async
    public CompletableFuture<Void> sendPasswordChangedEmailAsync(String email, String name) {
        try {
            sendPasswordChangedEmail(email, name);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            logger.error("Failed to send password changed email to " + email + ", but password change succeeded", e);
            // Complete normally even if email fails - the main operation succeeded
            return CompletableFuture.completedFuture(null);
        }
    }

    /**
     * Async method to send account deleted email without blocking the main thread
     * Failures are logged but do not affect the main operation
     */
    @Override
    @Async
    public CompletableFuture<Void> sendAccountDeletedEmailAsync(String email, String name) {
        try {
            sendAccountDeletedEmail(email, name);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            logger.error("Failed to send account deleted email to " + email + ", but account deletion succeeded", e);
            // Complete normally even if email fails - the main operation succeeded
            return CompletableFuture.completedFuture(null);
        }
    }

    /**
     * Async method to send welcome email without blocking the main thread
     * Failures are logged but do not affect the main operation
     */
    @Override
    @Async
    public CompletableFuture<Void> sendWelcomeEmailAsync(String email, String firstName) {
        try {
            sendWelcomeEmail(email, firstName);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            logger.error("Failed to send welcome email to " + email + ", but registration succeeded", e);
            // Complete normally even if email fails - the main operation succeeded
            return CompletableFuture.completedFuture(null);
        }
    }
}
