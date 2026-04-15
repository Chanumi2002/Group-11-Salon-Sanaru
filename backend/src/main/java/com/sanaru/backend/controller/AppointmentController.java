package com.sanaru.backend.controller;

import com.sanaru.backend.dto.AppointmentRequest;
import com.sanaru.backend.dto.AppointmentResponse;
import com.sanaru.backend.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AppointmentResponse> bookAppointment(@Valid @RequestBody AppointmentRequest request, Principal principal) {
        String userEmail = principal.getName();
        AppointmentResponse response = appointmentService.createAppointment(request, userEmail);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments(Principal principal) {
        String userEmail = principal.getName();
        List<AppointmentResponse> response = appointmentService.getAppointmentsByUser(userEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-date/{date}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByDate(@PathVariable String date) {
        List<AppointmentResponse> response = appointmentService.getAppointmentsByDate(java.time.LocalDate.parse(date));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/availability/{date}")
    public ResponseEntity<List<Map<String, Object>>> getSlotAvailability(@PathVariable String date) {
        List<Map<String, Object>> availability = appointmentService.getSlotAvailability(java.time.LocalDate.parse(date));
        return ResponseEntity.ok(availability);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AppointmentResponse> cancelAppointment(@PathVariable Long id, Principal principal) {
        String userEmail = principal.getName();
        AppointmentResponse response = appointmentService.cancelAppointment(id, userEmail);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        List<AppointmentResponse> response = appointmentService.getAllAppointments();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppointmentResponse> approveAppointment(@PathVariable Long id) {
        AppointmentResponse response = appointmentService.approveAppointment(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppointmentResponse> rejectAppointment(@PathVariable Long id) {
        AppointmentResponse response = appointmentService.rejectAppointment(id);
        return ResponseEntity.ok(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNoSuchElement(NoSuchElementException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
