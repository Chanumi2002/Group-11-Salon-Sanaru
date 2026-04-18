package com.sanaru.backend.service;

import java.time.LocalDate;

public interface HolidayService {
    /**
     * Check if a given date is a holiday
     * @param date the date to check
     * @return true if the date is within a holiday period, false otherwise
     */
    boolean isHoliday(LocalDate date);
}
