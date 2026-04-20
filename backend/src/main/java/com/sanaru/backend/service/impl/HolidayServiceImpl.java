package com.sanaru.backend.service.impl;

import com.sanaru.backend.model.Holiday;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HolidayServiceImpl implements com.sanaru.backend.service.HolidayService {

    private List<Holiday> holidays = new ArrayList<>();

    @PostConstruct
    public void init() {
        loadHolidays();
    }

    /**
     * Check if a given date is a holiday
     * @param date the date to check
     * @return true if the date is within a holiday period, false otherwise
     */
    @Override
    public boolean isHoliday(LocalDate date) {
        if (holidays.isEmpty()) {
            return false;
        }

        return holidays.stream()
                .anyMatch(holiday -> {
                    LocalDate startDate = holiday.getStartDate();
                    LocalDate endDate = holiday.getEndDate();
                    
                    // Check if the date is within the holiday period (inclusive of both start and end)
                    return !date.isBefore(startDate) && !date.isAfter(endDate);
                });
    }

    /**
     * Load holidays from the 2026.json file
     */
    private void loadHolidays() {
        try {
            InputStream is = getClass().getResourceAsStream("/holidays/2026.json");
            
            if (is == null) {
                System.err.println("Holiday file not found: /holidays/2026.json");
                return;
            }
            
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule()); // Explicitly register JavaTimeModule for LocalDate handling
            
            Holiday[] holidayArray = mapper.readValue(is, Holiday[].class);
            holidays = Arrays.asList(holidayArray);
            
            System.out.println("Successfully loaded " + holidays.size() + " holidays from 2026.json for HolidayServiceImpl");
        } catch (Exception e) {
            System.err.println("Error loading holidays in HolidayServiceImpl: " + e.getMessage());
            e.printStackTrace();
            holidays = new ArrayList<>();
        }
    }
}
