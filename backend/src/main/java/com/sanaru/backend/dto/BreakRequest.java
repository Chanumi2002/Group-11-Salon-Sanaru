package com.sanaru.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalTime;

@Data
public class BreakRequest {
    @NotBlank(message = "Break name is required")
    private String breakName;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    private Boolean isActive;
}
