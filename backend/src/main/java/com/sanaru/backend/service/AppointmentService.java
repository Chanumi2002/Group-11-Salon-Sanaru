package com.sanaru.backend.service;

import com.sanaru.backend.dto.AppointmentRequest;
import com.sanaru.backend.dto.AppointmentResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AppointmentService {
    AppointmentResponse createAppointment(AppointmentRequest request, String userEmail);
    List<AppointmentResponse> getAppointmentsByUser(String userEmail);
    List<AppointmentResponse> getAppointmentsByDate(LocalDate date);
    List<Map<String, Object>> getSlotAvailability(LocalDate date);
    AppointmentResponse cancelAppointment(Long appointmentId, String userEmail);
    List<AppointmentResponse> getAllAppointments();
    AppointmentResponse approveAppointment(Long appointmentId);
    AppointmentResponse rejectAppointment(Long appointmentId);
    long getPendingAppointmentCount();
    Map<String, Integer> getCustomerAppointmentCounts(String userEmail);
}
