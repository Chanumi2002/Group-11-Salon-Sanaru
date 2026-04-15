package com.sanaru.backend.controller;

import com.sanaru.backend.dto.ClosedDateRequest;
import com.sanaru.backend.dto.ClosedDateResponse;
import com.sanaru.backend.service.ClosedDateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/closed-dates")
@RequiredArgsConstructor
public class ClosedDateController {

    private final ClosedDateService closedDateService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addClosedDate(@RequestBody ClosedDateRequest request) {
        try {
            ClosedDateResponse response = closedDateService.addClosedDate(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<List<ClosedDateResponse>> getAllClosedDates() {
        List<ClosedDateResponse> closedDates = closedDateService.getAllClosedDates();
        return ResponseEntity.ok(closedDates);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ClosedDateResponse>> getActiveClosedDates() {
        List<ClosedDateResponse> closedDates = closedDateService.getActiveClosedDates();
        return ResponseEntity.ok(closedDates);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateClosedDate(
            @PathVariable Long id,
            @RequestBody ClosedDateRequest request) {
        try {
            ClosedDateResponse response = closedDateService.updateClosedDate(id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteClosedDate(@PathVariable Long id) {
        try {
            closedDateService.deleteClosedDate(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
