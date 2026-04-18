package com.sanaru.backend.controller;

import com.sanaru.backend.dto.HolidayOverrideRequest;
import com.sanaru.backend.dto.HolidayOverrideResponse;
import com.sanaru.backend.service.HolidayOverrideService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/holiday-overrides")
@RequiredArgsConstructor
public class HolidayOverrideController {

    private final HolidayOverrideService holidayOverrideService;

    /**
     * Create or update a holiday override
     * Admin can mark a system holiday as a working date or set custom hours
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createOrUpdateOverride(@Valid @RequestBody HolidayOverrideRequest request) {
        try {
            HolidayOverrideResponse response = holidayOverrideService.createOrUpdateOverride(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create holiday override: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Update an existing holiday override by ID
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOverride(@PathVariable Long id, @Valid @RequestBody HolidayOverrideRequest request) {
        try {
            HolidayOverrideResponse response = holidayOverrideService.updateOverride(id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to update holiday override: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get all holiday overrides
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<HolidayOverrideResponse>> getAllOverrides() {
        List<HolidayOverrideResponse> overrides = holidayOverrideService.getAllOverrides();
        return ResponseEntity.ok(overrides);
    }

    /**
     * Get all working date overrides (marked as open)
     */
    @GetMapping("/working-dates")
    public ResponseEntity<List<HolidayOverrideResponse>> getWorkingDateOverrides() {
        List<HolidayOverrideResponse> overrides = holidayOverrideService.getWorkingDateOverrides();
        return ResponseEntity.ok(overrides);
    }

    /**
     * Get override for a specific date
     */
    @GetMapping("/by-date")
    public ResponseEntity<?> getOverrideByDate(@RequestParam LocalDate date) {
        try {
            Optional<HolidayOverrideResponse> override = holidayOverrideService.getOverrideByDate(date);
            return ResponseEntity.ok(override.orElse(null));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching override: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get custom hours for a date (if available)
     */
    @GetMapping("/custom-hours")
    public ResponseEntity<?> getCustomHours(@RequestParam LocalDate date) {
        try {
            Optional<Map<String, Object>> customHours = holidayOverrideService.getCustomHours(date);
            if (customHours.isPresent()) {
                return ResponseEntity.ok(customHours.get());
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("message", "No custom hours set for date: " + date);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching custom hours: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get overrides within a date range
     */
    @GetMapping("/between")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<HolidayOverrideResponse>> getOverridesBetween(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        List<HolidayOverrideResponse> overrides = holidayOverrideService.getOverridesBetween(startDate, endDate);
        return ResponseEntity.ok(overrides);
    }

    /**
     * Check if a date is marked as working date override
     */
    @GetMapping("/is-working-date")
    public ResponseEntity<?> isWorkingDateOverride(@RequestParam LocalDate date) {
        try {
            boolean isWorking = holidayOverrideService.isWorkingDateOverride(date);
            Map<String, Object> response = new HashMap<>();
            response.put("date", date);
            response.put("isWorkingDate", isWorking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error checking date status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Delete a holiday override (revert to default)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteOverride(@PathVariable Long id) {
        try {
            holidayOverrideService.deleteOverride(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Holiday override deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error deleting override: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Delete override by date
     */
    @DeleteMapping("/by-date")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteOverrideByDate(@RequestParam LocalDate date) {
        try {
            holidayOverrideService.deleteOverrideByDate(date);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Holiday override deleted successfully for date: " + date);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error deleting override: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
