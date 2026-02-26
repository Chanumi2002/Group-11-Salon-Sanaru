package com.sanaru.backend.service.mpl;

import com.sanaru.backend.service.EmailService;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Override
    public void sendWelcomeEmail(String email, String firstName) {
        // TODO: Implement email sending logic
        System.out.println("Sending welcome email to: " + email);
    }

    @Override
    public void sendPasswordResetEmail(String email, String resetToken) {
        // TODO: Implement password reset email sending logic
        System.out.println("Sending password reset email to: " + email);
    }

    @Override
    public void sendPasswordChangedEmail(String email, String name) {
        // TODO: Implement password changed email sending logic
        System.out.println("Sending password changed email to: " + email);
    }

    @Override
    public void sendAccountDeletedEmail(String email, String name) {
        // TODO: Implement account deleted email sending logic
        System.out.println("Sending account deleted email to: " + email);
    }
}
