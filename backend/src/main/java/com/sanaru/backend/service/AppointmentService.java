package com.sanaru.backend.service;

import com.sanaru.backend.dto.AppointmentRequest;
import com.sanaru.backend.dto.AppointmentResponse;

import java.util.List;

public interface AppointmentService {
    AppointmentResponse createAppointment(AppointmentRequest request, String userEmail);
    List<AppointmentResponse> getAppointmentsByUser(String userEmail);
    AppointmentResponse cancelAppointment(Long appointmentId, String userEmail);
}
