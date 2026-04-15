package com.sanaru.backend.dto;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;

@Getter
@Setter
public class FeedbackRequest {
    
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating; // 1-5 stars
    
    @NotBlank(message = "Comment cannot be empty")
    @Size(min = 10, message = "Comment must be at least 10 characters long")
    private String comment; // Feedback text
    
    @NotBlank(message = "Feedback type is required")
    private String feedbackType; // SERVICE, PRODUCT, GENERAL
    
    private Long targetId; // Optional: ID of service/product being reviewed
}
