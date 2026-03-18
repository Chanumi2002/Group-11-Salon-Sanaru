package com.sanaru.backend.config;

import com.sanaru.backend.dto.RegisterRequest;
import com.sanaru.backend.enums.Gender;
import com.sanaru.backend.repository.UserRepository;
import com.sanaru.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Automatically seeds an administrator account on application startup if one
 * does not already exist.  This ensures that the deployed backend always
 * has a usable admin user (female, email salonsanaru28@gmail.com).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "salonsanaru28@gmail.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            RegisterRequest req = new RegisterRequest();
            req.setEmail(adminEmail);
            req.setPassword("qazxsw");
            req.setFirstName("Salon");
            req.setLastName("Sanaru");
            req.setGender(Gender.FEMALE);
            req.setPhone(null);

            userService.registerAdminUser(req);
            System.out.println("[DataSeeder] seeded admin user: " + adminEmail);
        } else {
            System.out.println("[DataSeeder] admin user already exists, skipping seeding.");
        }
    }
}
