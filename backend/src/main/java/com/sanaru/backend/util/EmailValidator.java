package com.sanaru.backend.util;

import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.InitialDirContext;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

public class EmailValidator {

    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    private static final Pattern EMAIL_PATTERN = Pattern.compile(EMAIL_REGEX);

    // Common throwaway/temporary email domains to reject
    private static final Set<String> THROWAWAY_DOMAINS = new HashSet<>();

    static {
        THROWAWAY_DOMAINS.addAll(java.util.Arrays.asList(
                "10minutemail.com",
                "tempmail.com",
                "temp-mail.org",
                "throwaway.email",
                "mailinator.com",
                "maildrop.cc",
                "yopmail.com",
                "fakeinbox.com",
                "sharklasers.com",
                "trashmail.com",
                "temp-mail.io",
                "binkmail.com",
                "trash-mail.com",
                "spam4.me",
                "10minutemail.net",
                "tempmail.net",
                "emailondeck.com",
                "getairmail.com",
                "getnada.com",
                "grrymail.com",
                "mail.tm",
                "temp-mail.cc",
                "throwawaymail.com",
                "mintemail.com",
                "mockemail.com",
                "tempemaill.com",
                "dispostable.com",
                "tempmail.us",
                "fakemail.net",
                "mailnesia.com"
        ));
    }

    /**
     * Validates if an email is actual/real by checking:
     * 1. Format validity
     * 2. Domain MX records (domain can receive emails)
     * 3. Not a known throwaway domain
     *
     * @param email the email to validate
     * @return true if email is valid/real, false otherwise
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }

        email = email.trim().toLowerCase();

        // Check format
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            return false;
        }

        // Extract domain
        String domain = email.substring(email.indexOf('@') + 1);

        // Check if domain is throwaway
        if (isThrowawayDomain(domain)) {
            return false;
        }

        // Check MX records - domain must exist and have MX records
        return hasMXRecords(domain);
    }

    /**
     * Checks if the domain is a known throwaway email domain
     */
    private static boolean isThrowawayDomain(String domain) {
        return THROWAWAY_DOMAINS.contains(domain);
    }

    /**
     * Checks if the domain has valid MX records (can receive emails)
     */
    private static boolean hasMXRecords(String domain) {
        try {
            InitialDirContext dirContext = new InitialDirContext();
            Attributes attributes = dirContext.getAttributes(
                    "dns:/" + domain,
                    new String[]{"MX"}
            );
            Attribute mxRecord = attributes.get("MX");

            if (mxRecord == null) {
                return false;
            }

            // If MX records exist, domain is valid
            NamingEnumeration<?> enumeration = mxRecord.getAll();
            boolean hasRecords = enumeration.hasMore();
            enumeration.close();
            dirContext.close();

            return hasRecords;
        } catch (NamingException e) {
            // No MX records found or domain doesn't exist
            return false;
        }
    }

    /**
     * Get a user-friendly error message for invalid emails
     */
    public static String getValidationErrorMessage(String email) {
        if (email == null || email.trim().isEmpty()) {
            return "Email cannot be empty";
        }

        email = email.trim().toLowerCase();

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            return "Email format is invalid";
        }

        String domain = email.substring(email.indexOf('@') + 1);

        if (isThrowawayDomain(domain)) {
            return "Throwaway/temporary email addresses are not allowed. Please use a real email address.";
        }

        if (!hasMXRecords(domain)) {
            return "Email domain does not exist or cannot receive emails. Please check your email address.";
        }

        return "Email validation failed";
    }
}
