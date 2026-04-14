package com.sanaru.backend.service;

import com.sanaru.backend.dto.TimeSlotRequest;
import com.sanaru.backend.dto.TimeSlotResponse;

import java.time.DayOfWeek;
import java.util.List;

public interface TimeSlotService {
    TimeSlotResponse createTimeSlot(TimeSlotRequest request);
    List<TimeSlotResponse> getAllTimeSlots();
    List<TimeSlotResponse> getActiveTimeSlotsForDay(DayOfWeek dayOfWeek);
    TimeSlotResponse updateTimeSlot(Long id, TimeSlotRequest request);
    void deleteTimeSlot(Long id);
    TimeSlotResponse toggleTimeSlotActive(Long id);
}
