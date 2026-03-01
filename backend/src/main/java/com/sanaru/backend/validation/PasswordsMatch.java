package com.sanaru.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Custom validation annotation to ensure two password fields match
 * Used for newPassword and confirmPassword validation
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PasswordsMatchValidator.class)
public @interface PasswordsMatch {
    String message() default "New password and confirmation password must match";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    // Field names to compare
    String passwordField() default "newPassword";

    String confirmPasswordField() default "confirmPassword";
}
