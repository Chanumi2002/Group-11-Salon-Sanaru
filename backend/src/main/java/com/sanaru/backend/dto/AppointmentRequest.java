package com.sanaru.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequest {
    private Long serviceId;
    private LocalDate date;
    private LocalTime time;
}
