package com.sanaru.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class BreakResponse {
    private Long id;
    private String breakName;      // "Lunch", "Coffee", "Prayer", etc.
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
