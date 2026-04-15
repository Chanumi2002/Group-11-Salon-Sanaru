package com.sanaru.backend.service;

import com.sanaru.backend.dto.ClosedDateRequest;
import com.sanaru.backend.dto.ClosedDateResponse;
import java.time.LocalDate;
import java.util.List;

public interface ClosedDateService {
    ClosedDateResponse addClosedDate(ClosedDateRequest request);
    List<ClosedDateResponse> getAllClosedDates();
    List<ClosedDateResponse> getActiveClosedDates();
    ClosedDateResponse updateClosedDate(Long id, ClosedDateRequest request);
    void deleteClosedDate(Long id);
    boolean isDateClosed(LocalDate date);
}
