package com.sanaru.backend.service;

import com.sanaru.backend.dto.AppointmentRequest;
import com.sanaru.backend.dto.AppointmentResponse;

public interface AppointmentService {
    AppointmentResponse createAppointment(AppointmentRequest request, String userEmail);
}
