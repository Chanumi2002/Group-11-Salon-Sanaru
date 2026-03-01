package com.sanaru.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.lang.reflect.Field;

/**
 * Validator implementation for @PasswordsMatch annotation
 * Validates that two password fields match
 */
public class PasswordsMatchValidator implements ConstraintValidator<PasswordsMatch, Object> {

    private String passwordField;
    private String confirmPasswordField;

    @Override
    public void initialize(PasswordsMatch constraintAnnotation) {
        this.passwordField = constraintAnnotation.passwordField();
        this.confirmPasswordField = constraintAnnotation.confirmPasswordField();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        try {
            // Get the password field value
            Field passwordFieldObj = value.getClass().getDeclaredField(passwordField);
            passwordFieldObj.setAccessible(true);
            Object password = passwordFieldObj.get(value);

            // Get the confirm password field value
            Field confirmPasswordFieldObj = value.getClass().getDeclaredField(confirmPasswordField);
            confirmPasswordFieldObj.setAccessible(true);
            Object confirmPassword = confirmPasswordFieldObj.get(value);

            // Both should not be null and should be equal
            if (password == null || confirmPassword == null) {
                return false;
            }

            return password.equals(confirmPassword);

        } catch (NoSuchFieldException | IllegalAccessException e) {
            // If fields don't exist or cannot access, validation passes
            // (other validators will handle null/missing field validation)
            return true;
        }
    }
}
