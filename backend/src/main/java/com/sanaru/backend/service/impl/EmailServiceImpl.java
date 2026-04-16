package com.sanaru.backend.service.impl;

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
    public void sendBookingRequestConfirmationEmail(String toEmail, String customerName, String serviceName,
            String appointmentDate, String appointmentTime) {
        try {
            String subject = "Booking Request Received - Salon Sanaru 📅";
            String htmlContent = buildBookingRequestConfirmationHtml(customerName, serviceName,
                    appointmentDate, appointmentTime);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Booking request confirmation email sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send booking request confirmation email to " + toEmail, e);
            throw new RuntimeException("Failed to send booking request confirmation email", e);
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
    public void sendAppointmentApprovedEmail(String toEmail, String customerName, String serviceName,
            String appointmentDate, String appointmentTime) {
        try {
            String subject = "Appointment Approved! ✅ - Salon Sanaru";
            String htmlContent = buildAppointmentApprovedHtml(customerName, serviceName,
                    appointmentDate, appointmentTime);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Appointment approved email sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send appointment approved email to " + toEmail, e);
            throw new RuntimeException("Failed to send appointment approved email", e);
        }
    }

    @Override
    public void sendAppointmentRejectedEmail(String toEmail, String customerName, String serviceName,
            String appointmentDate, String appointmentTime) {
        try {
            String subject = "Appointment Request Declined - Salon Sanaru ❌";
            String htmlContent = buildAppointmentRejectedHtml(customerName, serviceName,
                    appointmentDate, appointmentTime);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Appointment rejected email sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send appointment rejected email to " + toEmail, e);
            throw new RuntimeException("Failed to send appointment rejected email", e);
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

    @Override
    @Async("taskExecutor")
    public void sendReviewNotificationToAdmin(com.sanaru.backend.dto.FeedbackResponse feedback) {
        try {
            String subject = "New Review/Feedback Submitted - Salon Sanaru ⭐";
            String htmlContent = buildReviewNotificationHtml(feedback);
            sendHtmlEmail(supportEmail, subject, htmlContent);
            logger.info("Review notification email sent successfully to admin");
        } catch (Exception e) {
            logger.error("Failed to send review notification email to admin", e);
            // Async task failure - logged but doesn't affect user experience
        }
    }

    @Override
    public void sendPaymentSuccessEmail(String toEmail, String customerName, String orderId, double amount, String paymentMethod) {
        try {
            String subject = "Payment Successful - Order #" + orderId + " 💳✓";
            String htmlContent = buildPaymentSuccessHtml(customerName, orderId, amount, paymentMethod);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Payment success email sent to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send payment success email to " + toEmail, e);
        }
    }

    @Override
    public void sendPaymentFailureEmail(String toEmail, String customerName, String orderId, String reason) {
        try {
            String subject = "Payment Failed - Order #" + orderId + " ❌";
            String htmlContent = buildPaymentFailureHtml(customerName, orderId, reason);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Payment failure email sent to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send payment failure email to " + toEmail, e);
        }
    }

    @Override
    public void sendRefundConfirmationEmail(String toEmail, String customerName, String orderId, double refundAmount) {
        try {
            String subject = "Refund Processed - Order #" + orderId + " ✓";
            String htmlContent = buildRefundConfirmationHtml(customerName, orderId, refundAmount);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Refund confirmation email sent to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send refund confirmation email to " + toEmail, e);
        }
    }

    @Override
    public void sendAdminPaymentNotification(String merchantReference, double amount, String status, String paymentMethod) {
        try {
            String subject = "Payment Transaction Notification - " + status + " 💰";
            String htmlContent = buildAdminPaymentNotificationHtml(merchantReference, amount, status, paymentMethod);
            sendHtmlEmail(supportEmail, subject, htmlContent);
            logger.info("Admin payment notification sent for reference: " + merchantReference);
        } catch (Exception e) {
            logger.error("Failed to send admin payment notification", e);
        }
    }

    @Override
    public void sendOrderStatusUpdateEmail(String toEmail, String customerName, String orderId, String newStatus) {
        try {
            String subject = "Order Status Update - Order #" + orderId + " 📦";
            String htmlContent = buildOrderStatusUpdateHtml(customerName, orderId, newStatus);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Order status update email sent to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send order status update email to " + toEmail, e);
        }
    }

    @Override
    public void sendOrderCancellationConfirmationEmail(String toEmail, String customerName, String orderId, double refundAmount) {
        try {
            String subject = "Order Cancelled - Refund #" + orderId + " ✓";
            String htmlContent = buildOrderCancellationHtml(customerName, orderId, refundAmount);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Order cancellation email sent to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send order cancellation email to " + toEmail, e);
        }
    }

    @Override
    public void sendOrderApprovedEmail(String toEmail, String customerName, String orderId, double totalAmount) {
        try {
            String subject = "Your Order #" + orderId + " Has Been Approved! ✅";
            String htmlContent = buildOrderApprovedHtml(customerName, orderId, totalAmount);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Order approval email sent to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send order approval email to " + toEmail, e);
        }
    }

    @Override
    public void sendOrderCancellationRequestEmail(String toEmail, String customerName, String orderId, double amount) {
        try {
            String subject = "Cancellation Request Received - Order #" + orderId + " 📋";
            String htmlContent = buildOrderCancellationRequestHtml(customerName, orderId, amount);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Cancellation request confirmation email sent to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send cancellation request email to " + toEmail, e);
        }
    }

    @Override
    public void sendCancellationRequestRejectedEmail(String toEmail, String customerName, String orderId) {
        try {
            String subject = "Cancellation Request Declined - Order #" + orderId + " ❌";
            String htmlContent = buildCancellationRequestRejectedHtml(customerName, orderId);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Cancellation rejection email sent to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send cancellation rejection email to " + toEmail, e);
        }
    }

    @Override
    public void sendServiceBookingConfirmationEmail(String toEmail, String customerName, String serviceName, double price, String bookingReference) {
        try {
            String subject = "Service Booking Confirmed - " + bookingReference + " 💅";
            String htmlContent = buildServiceBookingConfirmationHtml(customerName, serviceName, price, bookingReference);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Service booking confirmation email sent to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send service booking confirmation email to " + toEmail, e);
        }
    }

    @Override
    public void sendRefundRequestNotificationEmail(String toEmail, String customerName, String orderId, double refundAmount, String reason) {
        try {
            String subject = "Refund Request Received - Order #" + orderId;
            String htmlContent = buildRefundRequestHtml(customerName, orderId, refundAmount, reason);
            sendHtmlEmail(toEmail, subject, htmlContent);
            logger.info("Refund request notification email sent to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send refund request email to " + toEmail, e);
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

    private String buildBookingRequestConfirmationHtml(String customerName, String serviceName,
            String appointmentDate, String appointmentTime) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #d946a6;\">Booking Request Received! 📝</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hi " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Thank you for booking with us! We have received your appointment request and it is currently <strong>pending approval</strong>.</p>"
                + "<div style=\"background-color: #f9f0f6; padding: 20px; border-radius: 5px; margin: 20px 0;\">"
                + "<p style=\"margin: 10px 0;\"><strong>Service:</strong> " + serviceName + "</p>"
                + "<p style=\"margin: 10px 0;\"><strong>Requested Date:</strong> " + appointmentDate + "</p>"
                + "<p style=\"margin: 10px 0;\"><strong>Requested Time:</strong> " + appointmentTime + "</p>"
                + "</div>"
                + "<div style=\"background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;\">"
                + "<p style=\"margin: 0; color: #92400e;\"><strong>⏳ What happens next?</strong></p>"
                + "<p style=\"margin: 5px 0; color: #92400e; font-size: 14px;\">Our salon team will review your request and confirm availability. You will receive an email once your appointment is <strong style=\"color: #10b981;\">approved</strong> or we may contact you with alternative times.</p>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #666; margin: 20px 0;\">📧 <strong>Keep an eye on your inbox</strong> for confirmation. Check your spam folder if you don't see our email.</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/dashboard\" style=\"background-color: #d946a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">Track My Booking</a>"
                + "</p>"
                + "<hr style=\"border: none; border-top: 2px solid #f9f0f6; margin: 30px 0;\">"
                + "<p style=\"font-size: 12px; color: #999; text-align: center;\">Salon Sanaru<br/>Contact: (+94) 123-4567<br/>Email: support@sanaru.com</p>"
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

    private String buildAppointmentApprovedHtml(String customerName, String serviceName,
            String appointmentDate, String appointmentTime) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #10b981;\">Appointment Approved! ✅</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hi " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Great news! Your appointment request has been <strong>approved</strong> by our salon.</p>"
                + "<div style=\"background-color: #f0fdf4; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;\">"
                + "<p style=\"margin: 10px 0;\"><strong>Service:</strong> " + serviceName + "</p>"
                + "<p style=\"margin: 10px 0;\"><strong>Date:</strong> " + appointmentDate + "</p>"
                + "<p style=\"margin: 10px 0;\"><strong>Time:</strong> " + appointmentTime + "</p>"
                + "</div>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\"><strong>Important:</strong> Please arrive 10-15 minutes early to complete any check-in procedures.</p>"
                + "<p style=\"font-size: 14px; line-height: 1.6; color: #666;\">If you need to reschedule or cancel, please let us know as soon as possible.</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/dashboard\" style=\"background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">View My Appointments</a>"
                + "</p>"
                + "<hr style=\"border: none; border-top: 2px solid #f0fdf4; margin: 30px 0;\">"
                + "<p style=\"font-size: 12px; color: #999; text-align: center;\">Salon Sanaru<br/>Contact: (+94) 123-4567<br/>Email: support@sanaru.com</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildAppointmentRejectedHtml(String customerName, String serviceName,
            String appointmentDate, String appointmentTime) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #ef4444;\">Appointment Request Declined ❌</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hi " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Unfortunately, we were unable to approve your appointment request.</p>"
                + "<div style=\"background-color: #fef2f2; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;\">"
                + "<p style=\"margin: 10px 0;\"><strong>Service:</strong> " + serviceName + "</p>"
                + "<p style=\"margin: 10px 0;\"><strong>Requested Date:</strong> " + appointmentDate + "</p>"
                + "<p style=\"margin: 10px 0;\"><strong>Requested Time:</strong> " + appointmentTime + "</p>"
                + "</div>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">This could be due to:</p>"
                + "<ul style=\"font-size: 16px; line-height: 1.8;\">"
                + "<li>The requested time slot is unavailable</li>"
                + "<li>A scheduling conflict</li>"
                + "<li>Service availability</li>"
                + "</ul>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Please feel free to book another appointment at a different date or time.</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/book\" style=\"background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">Book Another Appointment</a>"
                + "</p>"
                + "<hr style=\"border: none; border-top: 2px solid #fef2f2; margin: 30px 0;\">"
                + "<p style=\"font-size: 12px; color: #999; text-align: center;\">Salon Sanaru<br/>Contact: (+94) 123-4567<br/>Email: support@sanaru.com</p>"
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

    private String buildReviewNotificationHtml(com.sanaru.backend.dto.FeedbackResponse feedback) {
        String ratingStars = "⭐".repeat(feedback.getRating()) + "☆".repeat(5 - feedback.getRating());
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #d946a6;\">New Review/Feedback Received ⭐</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">A new review has been submitted on your Salon Sanaru platform.</p>"
                + "<div style=\"background-color: #f9f0f6; padding: 20px; border-radius: 5px; margin: 20px 0;\">"
                + "<p><strong>Customer:</strong> " + (feedback.getUserName() != null ? feedback.getUserName() : "Anonymous") + "</p>"
                + "<p><strong>Feedback Type:</strong> " + feedback.getFeedbackType() + "</p>"
                + "<p><strong>Rating:</strong> " + ratingStars + " (" + feedback.getRating() + "/5)</p>"
                + "<p><strong>Comment:</strong></p>"
                + "<p style=\"font-style: italic; background-color: white; padding: 15px; border-left: 4px solid #d946a6;\">" + feedback.getComment() + "</p>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #666;\"><strong>Feedback ID:</strong> " + feedback.getId() + "</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:5174/admin_dashboard/feedback?id=" + feedback.getId() + "\" style=\"background-color: #d946a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">View in Dashboard</a>"
                + "</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildPaymentSuccessHtml(String customerName, String orderId, double amount, String paymentMethod) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #22c55e;\">Payment Successful! 💳✓</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hello " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Your payment has been processed successfully. Your order is being prepared.</p>"
                + "<div style=\"background-color: #f0fdf4; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #22c55e;\">"
                + "<p><strong>Order ID:</strong> #" + orderId + "</p>"
                + "<p><strong>Amount Paid:</strong> Rs. " + String.format("%.2f", amount) + "</p>"
                + "<p><strong>Payment Method:</strong> " + paymentMethod + "</p>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #666; margin: 20px 0;\">You can track your order status in your Salon Sanaru dashboard.</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/customer_dashboard/orders\" style=\"background-color: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">View Your Orders</a>"
                + "</p>"
                + "<p style=\"font-size: 12px; color: #999; text-align: center; margin-top: 30px;\">Thank you for shopping at Salon Sanaru!</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildPaymentFailureHtml(String customerName, String orderId, String reason) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #ef4444;\">Payment Failed ❌</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hello " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Unfortunately, your payment could not be processed. Please try again or contact support.</p>"
                + "<div style=\"background-color: #fef2f2; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;\">"
                + "<p><strong>Order ID:</strong> #" + orderId + "</p>"
                + "<p><strong>Reason:</strong> " + reason + "</p>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #666; margin: 20px 0;\">Your order is still saved. You can retry the payment whenever you're ready.</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/customer_dashboard/orders\" style=\"background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">Retry Payment</a>"
                + "</p>"
                + "<p style=\"font-size: 12px; color: #999; text-align: center; margin-top: 30px;\">Need help? Contact " + supportEmail + "</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildRefundConfirmationHtml(String customerName, String orderId, double refundAmount) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #3b82f6;\">Refund Processed ✓</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hello " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Your refund has been processed and will be credited back to your original payment method.</p>"
                + "<div style=\"background-color: #eff6ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;\">"
                + "<p><strong>Order ID:</strong> #" + orderId + "</p>"
                + "<p><strong>Refund Amount:</strong> Rs. " + String.format("%.2f", refundAmount) + "</p>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #666; margin: 20px 0;\">The refund may take 3-5 business days to appear in your account depending on your bank.</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/customer_dashboard/orders\" style=\"background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">View Orders</a>"
                + "</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildAdminPaymentNotificationHtml(String merchantReference, double amount, String status, String paymentMethod) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #8b5cf6;\">Payment Transaction Notification 💰</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">A payment transaction has been recorded on your Salon Sanaru platform.</p>"
                + "<div style=\"background-color: #faf5ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #8b5cf6;\">"
                + "<p><strong>Merchant Reference:</strong> " + merchantReference + "</p>"
                + "<p><strong>Amount:</strong> Rs. " + String.format("%.2f", amount) + "</p>"
                + "<p><strong>Status:</strong> <span style=\"background-color: " + (status.equals("COMPLETED") ? "#22c55e" : status.equals("FAILED") ? "#ef4444" : "#f59e0b") + "; color: white; padding: 5px 10px; border-radius: 3px;\">" + status + "</span></p>"
                + "<p><strong>Payment Method:</strong> " + paymentMethod + "</p>"
                + "</div>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/admin_dashboard/transactions\" style=\"background-color: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">View in Dashboard</a>"
                + "</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildOrderStatusUpdateHtml(String customerName, String orderId, String newStatus) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #06b6d4;\">Order Status Updated 📦</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hello " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Your order status has been updated!</p>"
                + "<div style=\"background-color: #ecf9ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #06b6d4;\">"
                + "<p><strong>Order ID:</strong> #" + orderId + "</p>"
                + "<p><strong>New Status:</strong> <strong>" + newStatus + "</strong></p>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #666; margin: 20px 0;\">We're working hard to prepare your order. You'll receive further updates soon.</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/customer_dashboard/orders\" style=\"background-color: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">Track Order</a>"
                + "</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildOrderCancellationHtml(String customerName, String orderId, double refundAmount) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #f97316;\">Order Cancelled ✓</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hello " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Your order has been successfully cancelled.</p>"
                + "<div style=\"background-color: #fff7ed; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f97316;\">"
                + "<p><strong>Order ID:</strong> #" + orderId + "</p>"
                + "<p><strong>Refund Amount:</strong> Rs. " + String.format("%.2f", refundAmount) + "</p>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #666; margin: 20px 0;\">The refund will be processed within 3-5 business days.</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/customer_dashboard/orders\" style=\"background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">View Orders</a>"
                + "</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildServiceBookingConfirmationHtml(String customerName, String serviceName, double price, String bookingReference) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #d946a6;\">Service Booking Confirmed 💅</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hello " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Your service booking has been confirmed! We're excited to serve you.</p>"
                + "<div style=\"background-color: #fdf4ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #d946a6;\">"
                + "<p><strong>Service:</strong> " + serviceName + "</p>"
                + "<p><strong>Booking Reference:</strong> " + bookingReference + "</p>"
                + "<p><strong>Price:</strong> Rs. " + String.format("%.2f", price) + "</p>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #666; margin: 20px 0;\">You will receive a confirmation email with appointment details shortly. If you have any questions, please contact us.</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/customer_dashboard/bookings\" style=\"background-color: #d946a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">View My Bookings</a>"
                + "</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildRefundRequestHtml(String customerName, String orderId, double refundAmount, String reason) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #3b82f6;\">Refund Request Received 📋</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hello " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">We have received your refund request and it is now under review by our team.</p>"
                + "<div style=\"background-color: #eff6ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;\">"
                + "<p><strong>Order ID:</strong> #" + orderId + "</p>"
                + "<p><strong>Requested Refund Amount:</strong> Rs. " + String.format("%.2f", refundAmount) + "</p>"
                + "<p><strong>Reason:</strong> " + reason + "</p>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #666; margin: 20px 0;\">Our team will review your request and process the refund within 3-5 business days. You'll receive an email once the refund is processed.</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/customer_dashboard/orders\" style=\"background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">Track Refund Status</a>"
                + "</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildOrderApprovedHtml(String customerName, String orderId, double totalAmount) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #10b981;\">Order Approved! ✅</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hello " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Great news! Your order has been approved and is now being prepared for shipment.</p>"
                + "<div style=\"background-color: #f0fdf4; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;\">"
                + "<p><strong>Order ID:</strong> #" + orderId + "</p>"
                + "<p><strong>Total Amount:</strong> Rs. " + String.format("%.2f", totalAmount) + "</p>"
                + "<p style=\"color: #10b981; font-weight: bold;\">✓ Status: CONFIRMED</p>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #666; margin: 20px 0;\">Our team is now preparing your order for shipping. You will receive tracking information soon via email.</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/customer_dashboard/orders\" style=\"background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">Track Your Order</a>"
                + "</p>"
                + "<p style=\"font-size: 12px; color: #999; text-align: center; margin-top: 30px;\">Thank you for shopping with Salon Sanaru!</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildOrderCancellationRequestHtml(String customerName, String orderId, double amount) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #f59e0b;\">Cancellation Request Received 📋</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hello " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">We have received your request to cancel order <strong>#" + orderId + "</strong>. Our team is reviewing your request and will process it shortly.</p>"
                + "<div style=\"background-color: #fffbeb; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;\">"
                + "<p><strong>Order ID:</strong> #" + orderId + "</p>"
                + "<p><strong>Order Amount:</strong> Rs. " + String.format("%.2f", amount) + "</p>"
                + "<p style=\"color: #92400e; font-weight: bold;\">Status: CANCELLATION PENDING</p>"
                + "</div>"
                + "<div style=\"background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;\">"
                + "<p style=\"margin: 0; color: #92400e;\"><strong>⏳ What happens next?</strong></p>"
                + "<p style=\"margin: 5px 0; color: #92400e; font-size: 14px;\">Our admin team will review your cancellation request within 24 hours. You will receive a confirmation email once your request is approved or if we need more information from you.</p>"
                + "</div>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/customer_dashboard/orders\" style=\"background-color: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">View Orders</a>"
                + "</p>"
                + "<p style=\"font-size: 12px; color: #999; text-align: center; margin-top: 30px;\">If you have any questions, please contact us at " + supportEmail + "</p>"
                + "</div>"
                + "</body></html>";
    }

    private String buildCancellationRequestRejectedHtml(String customerName, String orderId) {
        return "<html><body style=\"font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);\">"
                + "<h2 style=\"color: #ef4444;\">Cancellation Request Not Approved ❌</h2>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Hello " + customerName + ",</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6;\">Unfortunately, we were unable to approve your cancellation request for order <strong>#" + orderId + "</strong>.</p>"
                + "<div style=\"background-color: #fef2f2; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;\">"
                + "<p><strong>Order ID:</strong> #" + orderId + "</p>"
                + "<p style=\"color: #7f1d1d; font-weight: bold;\">Status: CANCELLATION REJECTED</p>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #666; margin: 20px 0;\"><strong>Possible reasons:</strong></p>"
                + "<ul style=\"font-size: 14px; color: #666; margin: 20px 0;\">"
                + "<li>Order has already been shipped</li>"
                + "<li>Payment has already been processed</li>"
                + "<li>Order is currently being prepared</li>"
                + "</ul>"
                + "<p style=\"font-size: 14px; color: #666; margin: 20px 0;\">Your order will proceed as originally planned. If you have any concerns, please contact our support team.</p>"
                + "<p style=\"text-align: center; margin: 30px 0;\">"
                + "<a href=\"http://localhost:3000/customer_dashboard/orders\" style=\"background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">View Orders</a>"
                + "</p>"
                + "<p style=\"font-size: 12px; color: #999; text-align: center; margin-top: 30px;\">Contact: " + supportEmail + "</p>"
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
