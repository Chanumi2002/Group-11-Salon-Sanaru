package com.sanaru.backend.controller;

import com.sanaru.backend.model.Holiday;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/holidays")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HolidayController {

    private List<Holiday> holidays = new ArrayList<>();

    /**
     * Load holidays on initialization
     */
    @PostConstruct
    public void init() {
        loadHolidays();
    }

    /**
     * Get holidays for the current year (2026) - PUBLIC ENDPOINT
     */
    @GetMapping
    public List<Holiday> getHolidays() {
        return holidays;
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
            
            System.out.println("Successfully loaded " + holidays.size() + " holidays from 2026.json");
        } catch (Exception e) {
            System.err.println("Error loading holidays: " + e.getMessage());
            e.printStackTrace();
            holidays = new ArrayList<>();
        }
    }
}
