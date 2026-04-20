package com.sanaru.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
public class TimeSlotRequest {
    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    private Boolean isActive = true;
    
    @Positive(message = "Capacity must be a positive number")
    private Integer capacity = 1;
    
    @Positive(message = "Appointment duration must be a positive number")
    private Integer appointmentDuration = 30;
}
