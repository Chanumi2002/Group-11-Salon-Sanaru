package com.sanaru.backend.dto;

import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
public class TimeSlotResponse {
    private Long id;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isActive;
    private Integer capacity;  // Number of concurrent appointments
    private Integer appointmentDuration;  // Duration in minutes
    private List<BreakResponse> breaks;  // List of breaks for this time slot
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
