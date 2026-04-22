package com.sanaru.backend.dto;

import com.sanaru.backend.enums.AppointmentStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class AppointmentResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long serviceId;
    private String serviceName;
    private Integer serviceDurationMinutes;
    private LocalDate date;
    private LocalTime time;
    private LocalDateTime bookingEndTime;
    private LocalDateTime cancellationCutoffTime;
    private Boolean cancellable;
    private AppointmentStatus status;
}
