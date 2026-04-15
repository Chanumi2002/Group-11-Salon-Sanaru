package com.sanaru.backend.controller;

import com.sanaru.backend.dto.BreakRequest;
import com.sanaru.backend.dto.BreakResponse;
import com.sanaru.backend.service.BreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/time-slots/{timeSlotId}/breaks")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class BreakController {

    private final BreakService breakService;

    @PostMapping
    public ResponseEntity<BreakResponse> addBreak(
            @PathVariable Long timeSlotId,
            @RequestBody BreakRequest request) {
        BreakResponse response = breakService.addBreak(timeSlotId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BreakResponse>> getBreaks(
            @PathVariable Long timeSlotId) {
        List<BreakResponse> response = breakService.getBreaksByTimeSlot(timeSlotId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{breakId}")
    public ResponseEntity<BreakResponse> updateBreak(
            @PathVariable Long timeSlotId,
            @PathVariable Long breakId,
            @RequestBody BreakRequest request) {
        BreakResponse response = breakService.updateBreak(breakId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{breakId}")
    public ResponseEntity<Void> deleteBreak(
            @PathVariable Long timeSlotId,
            @PathVariable Long breakId) {
        breakService.deleteBreak(breakId);
        return ResponseEntity.noContent().build();
    }
}
