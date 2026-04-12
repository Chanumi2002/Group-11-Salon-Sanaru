package com.sanaru.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class FeedbackResponse {
    private Long id;
    private Long userId;
    private String userName; // First name + Last name
    private String userEmail;
    private Integer rating;
    private String comment;
    private String feedbackType;
    private Long targetId;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
