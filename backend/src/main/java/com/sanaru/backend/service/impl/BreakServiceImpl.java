package com.sanaru.backend.service.impl;

import com.sanaru.backend.dto.BreakRequest;
import com.sanaru.backend.dto.BreakResponse;
import com.sanaru.backend.model.Break;
import com.sanaru.backend.model.TimeSlot;
import com.sanaru.backend.repository.BreakRepository;
import com.sanaru.backend.repository.TimeSlotRepository;
import com.sanaru.backend.service.BreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BreakServiceImpl implements BreakService {

    private final BreakRepository breakRepository;
    private final TimeSlotRepository timeSlotRepository;

    @Override
    public BreakResponse addBreak(Long timeSlotId, BreakRequest request) {
        TimeSlot timeSlot = timeSlotRepository.findById(timeSlotId)
                .orElseThrow(() -> new NoSuchElementException("Time slot not found"));

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new IllegalArgumentException("Break start time must be before end time");
        }

        if (request.getStartTime().isBefore(timeSlot.getStartTime()) || 
            request.getEndTime().isAfter(timeSlot.getEndTime())) {
            throw new IllegalArgumentException("Break must be within time slot working hours");
        }

        Break breakPeriod = new Break();
        breakPeriod.setTimeSlot(timeSlot);
        breakPeriod.setBreakName(request.getBreakName());
        breakPeriod.setStartTime(request.getStartTime());
        breakPeriod.setEndTime(request.getEndTime());
        breakPeriod.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        Break savedBreak = breakRepository.save(breakPeriod);
        return mapToResponse(savedBreak);
    }

    @Override
    public BreakResponse updateBreak(Long breakId, BreakRequest request) {
        Break breakPeriod = breakRepository.findById(breakId)
                .orElseThrow(() -> new NoSuchElementException("Break not found"));

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new IllegalArgumentException("Break start time must be before end time");
        }

        TimeSlot timeSlot = breakPeriod.getTimeSlot();
        if (request.getStartTime().isBefore(timeSlot.getStartTime()) || 
            request.getEndTime().isAfter(timeSlot.getEndTime())) {
            throw new IllegalArgumentException("Break must be within time slot working hours");
        }

        breakPeriod.setBreakName(request.getBreakName());
        breakPeriod.setStartTime(request.getStartTime());
        breakPeriod.setEndTime(request.getEndTime());
        if (request.getIsActive() != null) {
            breakPeriod.setIsActive(request.getIsActive());
        }

        Break updatedBreak = breakRepository.save(breakPeriod);
        return mapToResponse(updatedBreak);
    }

    @Override
    public void deleteBreak(Long breakId) {
        if (!breakRepository.existsById(breakId)) {
            throw new NoSuchElementException("Break not found");
        }
        breakRepository.deleteById(breakId);
    }

    @Override
    public List<BreakResponse> getBreaksByTimeSlot(Long timeSlotId) {
        return breakRepository.findByTimeSlotId(timeSlotId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private BreakResponse mapToResponse(Break breakPeriod) {
        BreakResponse response = new BreakResponse();
        response.setId(breakPeriod.getId());
        response.setBreakName(breakPeriod.getBreakName());
        response.setStartTime(breakPeriod.getStartTime());
        response.setEndTime(breakPeriod.getEndTime());
        response.setIsActive(breakPeriod.getIsActive());
        response.setCreatedAt(breakPeriod.getCreatedAt());
        response.setUpdatedAt(breakPeriod.getUpdatedAt());
        return response;
    }
}
