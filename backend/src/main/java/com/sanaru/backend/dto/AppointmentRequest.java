package com.sanaru.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequest {
    
    @NotNull(message = "Service ID is required")
    @Positive(message = "Service ID must be a positive number")
    private Long serviceId;
    
    @NotNull(message = "Date is required")
    private LocalDate date;
    
    @NotNull(message = "Time is required")
    private LocalTime time;
    
    @NotNull(message = "Time Slot ID is required")
    private Long timeSlotId;
}
