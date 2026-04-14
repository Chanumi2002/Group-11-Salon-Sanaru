package com.sanaru.backend.dto;

import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
public class TimeSlotRequest {
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isActive = true;
    private Integer capacity = 1;  // Number of concurrent appointments allowed
}
