package com.sanaru.backend.service.impl;

import com.sanaru.backend.dto.HolidayOverrideRequest;
import com.sanaru.backend.dto.HolidayOverrideResponse;
import com.sanaru.backend.model.HolidayOverride;
import com.sanaru.backend.model.User;
import com.sanaru.backend.repository.HolidayOverrideRepository;
import com.sanaru.backend.repository.UserRepository;
import com.sanaru.backend.service.HolidayOverrideService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HolidayOverrideServiceImpl implements HolidayOverrideService {

    private final HolidayOverrideRepository holidayOverrideRepository;
    private final UserRepository userRepository;

    @Override
    public HolidayOverrideResponse createOrUpdateOverride(HolidayOverrideRequest request) {
        if (request.getHolidayDate() == null) {
            throw new IllegalArgumentException("Holiday date cannot be null");
        }

        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find existing override or create new one
        HolidayOverride override = holidayOverrideRepository.findByHolidayDate(request.getHolidayDate())
                .orElse(new HolidayOverride());

        // Update fields
        override.setHolidayUid(request.getHolidayUid());
        override.setHolidayDate(request.getHolidayDate());
        override.setHolidaySummary(request.getHolidaySummary());
        override.setIsWorkingDate(request.getIsWorkingDate() != null ? request.getIsWorkingDate() : false);
        override.setReason(request.getReason());
        override.setUseCustomHours(request.getUseCustomHours() != null ? request.getUseCustomHours() : false);
        override.setCustomStartTime(request.getCustomStartTime());
        override.setCustomEndTime(request.getCustomEndTime());
        override.setCustomCapacity(request.getCustomCapacity());
        override.setCreatedBy(currentUser);

        HolidayOverride saved = holidayOverrideRepository.save(override);
        log.info("Holiday override created/updated for date: {} by user: {}", request.getHolidayDate(), username);

        return mapToResponse(saved);
    }

    @Override
    public HolidayOverrideResponse updateOverride(Long id, HolidayOverrideRequest request) {
        if (request.getHolidayDate() == null) {
            throw new IllegalArgumentException("Holiday date cannot be null");
        }

        HolidayOverride override = holidayOverrideRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Holiday override not found with ID: " + id));

        // Update fields
        override.setHolidayUid(request.getHolidayUid());
        override.setHolidayDate(request.getHolidayDate());
        override.setHolidaySummary(request.getHolidaySummary());
        override.setIsWorkingDate(request.getIsWorkingDate() != null ? request.getIsWorkingDate() : false);
        override.setReason(request.getReason());
        override.setUseCustomHours(request.getUseCustomHours() != null ? request.getUseCustomHours() : false);
        override.setCustomStartTime(request.getCustomStartTime());
        override.setCustomEndTime(request.getCustomEndTime());
        override.setCustomCapacity(request.getCustomCapacity());

        HolidayOverride saved = holidayOverrideRepository.save(override);
        log.info("Holiday override updated for ID: {} with date: {}", id, request.getHolidayDate());

        return mapToResponse(saved);
    }

    @Override
    public List<HolidayOverrideResponse> getAllOverrides() {
        return holidayOverrideRepository.findAll().stream()
                .map(this::mapToResponse)
                .sorted(Comparator.comparing(HolidayOverrideResponse::getHolidayDate))
                .collect(Collectors.toList());
    }

    @Override
    public List<HolidayOverrideResponse> getWorkingDateOverrides() {
        return holidayOverrideRepository.findByIsWorkingDateTrue().stream()
                .map(this::mapToResponse)
                .sorted(Comparator.comparing(HolidayOverrideResponse::getHolidayDate))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<HolidayOverrideResponse> getOverrideByDate(LocalDate date) {
        return holidayOverrideRepository.findByHolidayDate(date)
                .map(this::mapToResponse);
    }

    @Override
    public void deleteOverride(Long id) {
        HolidayOverride override = holidayOverrideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Holiday override not found"));

        holidayOverrideRepository.delete(override);
        log.info("Holiday override deleted with id: {}", id);
    }

    @Override
    public void deleteOverrideByDate(LocalDate date) {
        holidayOverrideRepository.findByHolidayDate(date).ifPresent(override -> {
            holidayOverrideRepository.delete(override);
            log.info("Holiday override deleted for date: {}", date);
        });
    }

    @Override
    public boolean isWorkingDateOverride(LocalDate date) {
        return holidayOverrideRepository.findByHolidayDate(date)
                .map(HolidayOverride::getIsWorkingDate)
                .orElse(false);
    }

    @Override
    public Optional<Map<String, Object>> getCustomHours(LocalDate date) {
        return holidayOverrideRepository.findByHolidayDate(date)
                .filter(override -> override.getUseCustomHours() != null && override.getUseCustomHours())
                .map(override -> {
                    Map<String, Object> customHours = new HashMap<>();
                    customHours.put("startTime", override.getCustomStartTime());
                    customHours.put("endTime", override.getCustomEndTime());
                    customHours.put("capacity", override.getCustomCapacity());
                    return customHours;
                });
    }

    @Override
    public List<HolidayOverrideResponse> getOverridesBetween(LocalDate startDate, LocalDate endDate) {
        return holidayOverrideRepository.findByHolidayDateBetween(startDate, endDate).stream()
                .map(this::mapToResponse)
                .sorted(Comparator.comparing(HolidayOverrideResponse::getHolidayDate))
                .collect(Collectors.toList());
    }

    /**
     * Convert HolidayOverride entity to response DTO
     */
    private HolidayOverrideResponse mapToResponse(HolidayOverride override) {
        HolidayOverrideResponse response = new HolidayOverrideResponse();
        response.setId(override.getId());
        response.setHolidayUid(override.getHolidayUid());
        response.setHolidayDate(override.getHolidayDate());
        response.setHolidaySummary(override.getHolidaySummary());
        response.setIsWorkingDate(override.getIsWorkingDate());
        response.setReason(override.getReason());
        response.setUseCustomHours(override.getUseCustomHours());
        response.setCustomStartTime(override.getCustomStartTime());
        response.setCustomEndTime(override.getCustomEndTime());
        response.setCustomCapacity(override.getCustomCapacity());
        response.setCreatedBy(override.getCreatedBy() != null ? override.getCreatedBy().getEmail() : null);
        response.setCreatedAt(override.getCreatedAt());
        response.setUpdatedAt(override.getUpdatedAt());
        return response;
    }
}
