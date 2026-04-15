package com.sanaru.backend.service;

import com.sanaru.backend.dto.BreakRequest;
import com.sanaru.backend.dto.BreakResponse;

import java.util.List;

public interface BreakService {
    BreakResponse addBreak(Long timeSlotId, BreakRequest request);
    BreakResponse updateBreak(Long breakId, BreakRequest request);
    void deleteBreak(Long breakId);
    List<BreakResponse> getBreaksByTimeSlot(Long timeSlotId);
}
