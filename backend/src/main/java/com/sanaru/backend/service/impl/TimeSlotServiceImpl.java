package com.sanaru.backend.service.impl;

import com.sanaru.backend.dto.TimeSlotRequest;
import com.sanaru.backend.dto.TimeSlotResponse;
import com.sanaru.backend.model.Break;
import com.sanaru.backend.model.TimeSlot;
import com.sanaru.backend.repository.TimeSlotRepository;
import com.sanaru.backend.service.TimeSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimeSlotServiceImpl implements TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;
    private static final List<DayOfWeek> DAYS_ORDER = Arrays.asList(
            DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY
    );

    @Override
    public TimeSlotResponse createTimeSlot(TimeSlotRequest request) {
        // Validate time ranges
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setDayOfWeek(request.getDayOfWeek());
        timeSlot.setStartTime(request.getStartTime());
        timeSlot.setEndTime(request.getEndTime());
        timeSlot.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        timeSlot.setCapacity(request.getCapacity() != null ? request.getCapacity() : 1);

        TimeSlot savedTimeSlot = timeSlotRepository.save(timeSlot);
        return mapToResponse(savedTimeSlot);
    }

    @Override
    public List<TimeSlotResponse> getAllTimeSlots() {
        // Return ALL time slots (active and inactive) for admin dashboard management
        List<TimeSlot> timeSlots = timeSlotRepository.findAll();
        return timeSlots.stream()
                .sorted((a, b) -> {
                    int dayCompare = DAYS_ORDER.indexOf(a.getDayOfWeek()) - DAYS_ORDER.indexOf(b.getDayOfWeek());
                    if (dayCompare != 0) return dayCompare;
                    return a.getStartTime().compareTo(b.getStartTime());
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TimeSlotResponse> getActiveTimeSlotsForDay(DayOfWeek dayOfWeek) {
        List<TimeSlot> timeSlots = timeSlotRepository.findByDayOfWeekAndIsActiveTrue(dayOfWeek);
        
        // Generate individual appointment slots based on appointmentDuration
        List<TimeSlotResponse> appointmentSlots = new java.util.ArrayList<>();
        
        for (TimeSlot slot : timeSlots) {
            java.time.LocalTime currentTime = slot.getStartTime();
            int duration = slot.getAppointmentDuration() != null ? slot.getAppointmentDuration() : 30;
            
            while (currentTime.plusMinutes(duration).isBefore(slot.getEndTime()) || 
                   currentTime.plusMinutes(duration).equals(slot.getEndTime())) {
                TimeSlot appointmentSlot = new TimeSlot();
                appointmentSlot.setId(slot.getId());
                appointmentSlot.setDayOfWeek(slot.getDayOfWeek());
                appointmentSlot.setStartTime(currentTime);
                appointmentSlot.setEndTime(currentTime.plusMinutes(duration));
                appointmentSlot.setIsActive(slot.getIsActive());
                appointmentSlot.setCapacity(slot.getCapacity());
                appointmentSlot.setAppointmentDuration(duration);
                
                appointmentSlots.add(mapToResponse(appointmentSlot));
                
                currentTime = currentTime.plusMinutes(duration);
            }
        }
        
        return appointmentSlots;
    }

    @Override
    public TimeSlotResponse updateTimeSlot(Long id, TimeSlotRequest request) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Time slot not found"));

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        timeSlot.setDayOfWeek(request.getDayOfWeek());
        timeSlot.setStartTime(request.getStartTime());
        timeSlot.setEndTime(request.getEndTime());
        if (request.getIsActive() != null) {
            timeSlot.setIsActive(request.getIsActive());
        }
        if (request.getCapacity() != null && request.getCapacity() > 0) {
            timeSlot.setCapacity(request.getCapacity());
        }
        if (request.getAppointmentDuration() != null && request.getAppointmentDuration() > 0) {
            timeSlot.setAppointmentDuration(request.getAppointmentDuration());
        }

        TimeSlot updatedTimeSlot = timeSlotRepository.save(timeSlot);
        return mapToResponse(updatedTimeSlot);
    }

    @Override
    public void deleteTimeSlot(Long id) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Time slot not found"));
        timeSlotRepository.delete(timeSlot);
    }

    @Override
    public TimeSlotResponse toggleTimeSlotActive(Long id) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Time slot not found"));

        timeSlot.setIsActive(!timeSlot.getIsActive());
        TimeSlot updatedTimeSlot = timeSlotRepository.save(timeSlot);
        return mapToResponse(updatedTimeSlot);
    }

    private TimeSlotResponse mapToResponse(TimeSlot timeSlot) {
        TimeSlotResponse response = new TimeSlotResponse();
        response.setId(timeSlot.getId());
        response.setDayOfWeek(timeSlot.getDayOfWeek());
        response.setStartTime(timeSlot.getStartTime());
        response.setEndTime(timeSlot.getEndTime());
        response.setIsActive(timeSlot.getIsActive());
        response.setCapacity(timeSlot.getCapacity());
        response.setCreatedAt(timeSlot.getCreatedAt());
        response.setUpdatedAt(timeSlot.getUpdatedAt());
        response.setAppointmentDuration(timeSlot.getAppointmentDuration());
        
        // Map breaks if they exist
        if (timeSlot.getBreaks() != null && !timeSlot.getBreaks().isEmpty()) {
            response.setBreaks(timeSlot.getBreaks().stream()
                    .map(this::mapBreakToResponse)
                    .collect(Collectors.toList()));
        }
        
        return response;
    }
    
    private com.sanaru.backend.dto.BreakResponse mapBreakToResponse(Break breakPeriod) {
        com.sanaru.backend.dto.BreakResponse response = new com.sanaru.backend.dto.BreakResponse();
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
