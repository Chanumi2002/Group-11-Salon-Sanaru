package com.sanaru.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;

@Configuration
public class UploadResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            // Create absolute path to uploads directory
            Path uploadRoot = Paths.get("uploads").toAbsolutePath().normalize();
            
            // Ensure directory exists
            if (!Files.exists(uploadRoot)) {
                Files.createDirectories(uploadRoot);
            }
            
            // Convert to proper file URI (handle Windows/Unix paths)
            String uploadLocation = uploadRoot.toUri().toString();
            if (!uploadLocation.endsWith("/")) {
                uploadLocation += "/";
            }

            // Register resource handler for /uploads/** mapping to file system
            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations(uploadLocation)
                    .setCachePeriod(3600); // 1 hour cache
                    
        } catch (Exception e) {
            System.err.println("Failed to configure upload resource handler: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
