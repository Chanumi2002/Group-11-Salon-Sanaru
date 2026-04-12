package com.sanaru.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackRequest {
    private Integer rating; // 1-5 stars
    private String comment; // Feedback text
    private String feedbackType; // SERVICE, PRODUCT, GENERAL
    private Long targetId; // Optional: ID of service/product being reviewed
}
