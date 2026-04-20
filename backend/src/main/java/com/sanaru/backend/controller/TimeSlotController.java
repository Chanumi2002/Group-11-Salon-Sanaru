package com.sanaru.backend.controller;

import com.sanaru.backend.dto.TimeSlotRequest;
import com.sanaru.backend.dto.TimeSlotResponse;
import com.sanaru.backend.service.TimeSlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@RestController
@RequestMapping("/api/time-slots")
@RequiredArgsConstructor
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TimeSlotResponse> createTimeSlot(@Valid @RequestBody TimeSlotRequest request) {
        TimeSlotResponse response = timeSlotService.createTimeSlot(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TimeSlotResponse>> getAllTimeSlots() {
        List<TimeSlotResponse> response = timeSlotService.getAllTimeSlots();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available/{dayOfWeek}")
    public ResponseEntity<List<TimeSlotResponse>> getAvailableSlots(@PathVariable DayOfWeek dayOfWeek) {
        List<TimeSlotResponse> response = timeSlotService.getActiveTimeSlotsForDay(dayOfWeek);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TimeSlotResponse> updateTimeSlot(@PathVariable Long id, @Valid @RequestBody TimeSlotRequest request) {
        TimeSlotResponse response = timeSlotService.updateTimeSlot(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTimeSlot(@PathVariable Long id) {
        timeSlotService.deleteTimeSlot(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TimeSlotResponse> toggleTimeSlot(@PathVariable Long id) {
        TimeSlotResponse response = timeSlotService.toggleTimeSlotActive(id);
        return ResponseEntity.ok(response);
    }
}
