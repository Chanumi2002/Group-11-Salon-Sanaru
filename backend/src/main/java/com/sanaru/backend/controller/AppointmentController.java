package com.sanaru.backend.controller;

import com.sanaru.backend.dto.AppointmentRequest;
import com.sanaru.backend.dto.AppointmentResponse;
import com.sanaru.backend.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

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

    @GetMapping({"", "/history"})
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

    @GetMapping("/pending-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getPendingCount() {
        long count = appointmentService.getPendingAppointmentCount();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/my-status-counts")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Integer>> getMyStatusCounts(
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Integer> counts = appointmentService.getCustomerAppointmentCounts(userDetails.getUsername());
        return ResponseEntity.ok(counts);
    }
}
