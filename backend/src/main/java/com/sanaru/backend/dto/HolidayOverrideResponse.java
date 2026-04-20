package com.sanaru.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HolidayOverrideResponse {
    private Long id;
    private String holidayUid;
    private LocalDate holidayDate;
    private String holidaySummary;
    private Boolean isWorkingDate;
    private String reason;
    
    // Custom Hours
    private Boolean useCustomHours;
    private LocalTime customStartTime;
    private LocalTime customEndTime;
    private Integer customCapacity;
    
    // Audit
    private String createdBy;               // Username of admin who created it
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
