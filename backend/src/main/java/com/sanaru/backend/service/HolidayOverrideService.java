package com.sanaru.backend.service;

import com.sanaru.backend.dto.HolidayOverrideRequest;
import com.sanaru.backend.dto.HolidayOverrideResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface HolidayOverrideService {
    /**
     * Create or update a holiday override
     */
    HolidayOverrideResponse createOrUpdateOverride(HolidayOverrideRequest request);

    /**
     * Update an existing holiday override by ID
     */
    HolidayOverrideResponse updateOverride(Long id, HolidayOverrideRequest request);

    /**
     * Get all holiday overrides
     */
    List<HolidayOverrideResponse> getAllOverrides();

    /**
     * Get all working date overrides (marked as open)
     */
    List<HolidayOverrideResponse> getWorkingDateOverrides();

    /**
     * Get override for a specific date
     */
    Optional<HolidayOverrideResponse> getOverrideByDate(LocalDate date);

    /**
     * Delete an override (revert to default)
     */
    void deleteOverride(Long id);

    /**
     * Delete override by date
     */
    void deleteOverrideByDate(LocalDate date);

    /**
     * Check if a date is marked as working date (override)
     */
    boolean isWorkingDateOverride(LocalDate date);

    /**
     * Get custom hours for a date (if override has custom hours)
     */
    Optional<Map<String, Object>> getCustomHours(LocalDate date);

    /**
     * Get overrides within a date range
     */
    List<HolidayOverrideResponse> getOverridesBetween(LocalDate startDate, LocalDate endDate);
}
