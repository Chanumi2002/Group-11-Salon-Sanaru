package com.sanaru.backend.service.impl;

import com.sanaru.backend.dto.AppointmentRequest;
import com.sanaru.backend.dto.AppointmentResponse;
import com.sanaru.backend.enums.AppointmentStatus;
import com.sanaru.backend.model.Appointment;
import com.sanaru.backend.model.User;
import com.sanaru.backend.repository.AppointmentRepository;
import com.sanaru.backend.repository.ServiceRepository;
import com.sanaru.backend.repository.UserRepository;
import com.sanaru.backend.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;

    @Override
    public AppointmentResponse createAppointment(AppointmentRequest request, String userEmail) {
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        com.sanaru.backend.model.Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new NoSuchElementException("Service not found"));

        LocalTime requestedStartTime = request.getTime();
        LocalTime requestedEndTime = requestedStartTime.plusMinutes(service.getDurationMinutes());

        List<Appointment> existingAppointments = appointmentRepository.findByAppointmentDateAndStatusIn(
                request.getDate(),
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)
        );

        for (Appointment existing : existingAppointments) {
            LocalTime existingStartTime = existing.getAppointmentTime();
            LocalTime existingEndTime = existingStartTime.plusMinutes(existing.getService().getDurationMinutes());

            // Check if the time ranges overlap
            if (requestedStartTime.isBefore(existingEndTime) && requestedEndTime.isAfter(existingStartTime)) {
                throw new IllegalArgumentException("Time slot is unavailable");
            }
        }

        Appointment appointment = new Appointment();
        appointment.setCustomer(customer);
        appointment.setService(service);
        appointment.setAppointmentDate(request.getDate());
        appointment.setAppointmentTime(request.getTime());
        appointment.setStatus(AppointmentStatus.PENDING);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        AppointmentResponse response = new AppointmentResponse();
        response.setId(savedAppointment.getId());
        response.setCustomerId(customer.getId());
        response.setCustomerName(customer.getFirstName() + " " + customer.getLastName());
        response.setServiceId(service.getId());
        response.setServiceName(service.getName());
        response.setDate(savedAppointment.getAppointmentDate());
        response.setTime(savedAppointment.getAppointmentTime());
        response.setStatus(savedAppointment.getStatus());

        return response;
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByUser(String userEmail) {
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        List<Appointment> appointments = appointmentRepository.findByCustomerOrderByAppointmentDateDescAppointmentTimeDesc(customer);

        return appointments.stream().map(appointment -> {
            AppointmentResponse response = new AppointmentResponse();
            response.setId(appointment.getId());
            response.setCustomerId(appointment.getCustomer().getId());
            response.setCustomerName(appointment.getCustomer().getFirstName() + " " + appointment.getCustomer().getLastName());
            response.setServiceId(appointment.getService().getId());
            response.setServiceName(appointment.getService().getName());
            response.setDate(appointment.getAppointmentDate());
            response.setTime(appointment.getAppointmentTime());
            response.setStatus(appointment.getStatus());
            return response;
        }).collect(Collectors.toList());
    }

    @Override
    public AppointmentResponse cancelAppointment(Long appointmentId, String userEmail) {
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NoSuchElementException("Appointment not found"));

        if (!appointment.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("You are not authorized to cancel this appointment");
        }

        if (appointment.getStatus() != AppointmentStatus.PENDING && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException("Only pending or confirmed appointments can be cancelled");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        AppointmentResponse response = new AppointmentResponse();
        response.setId(updatedAppointment.getId());
        response.setCustomerId(updatedAppointment.getCustomer().getId());
        response.setCustomerName(updatedAppointment.getCustomer().getFirstName() + " " + updatedAppointment.getCustomer().getLastName());
        response.setServiceId(updatedAppointment.getService().getId());
        response.setServiceName(updatedAppointment.getService().getName());
        response.setDate(updatedAppointment.getAppointmentDate());
        response.setTime(updatedAppointment.getAppointmentTime());
        response.setStatus(updatedAppointment.getStatus());

        return response;
    }
}
