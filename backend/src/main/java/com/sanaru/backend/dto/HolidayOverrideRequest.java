package com.sanaru.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HolidayOverrideRequest {
    private String holidayUid;              // e.g., "sl_127"
    private LocalDate holidayDate;
    private String holidaySummary;
    private Boolean isWorkingDate;          // true = open, false = closed
    private String reason;
    
    // Custom Hours
    private Boolean useCustomHours;
    private LocalTime customStartTime;
    private LocalTime customEndTime;
    private Integer customCapacity;
}
