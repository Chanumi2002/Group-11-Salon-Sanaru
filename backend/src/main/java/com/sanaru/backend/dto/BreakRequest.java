package com.sanaru.backend.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class BreakRequest {
    private String breakName;      // "Lunch", "Coffee", "Prayer", etc.
    private LocalTime startTime;   // Break start time (e.g., 13:00)
    private LocalTime endTime;     // Break end time (e.g., 14:00)
    private Boolean isActive;      // Whether break is active
}
