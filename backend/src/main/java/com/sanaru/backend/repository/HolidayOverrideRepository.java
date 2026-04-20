package com.sanaru.backend.repository;

import com.sanaru.backend.model.HolidayOverride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HolidayOverrideRepository extends JpaRepository<HolidayOverride, Long> {
    /**
     * Find holiday override by specific date
     */
    Optional<HolidayOverride> findByHolidayDate(LocalDate holidayDate);

    /**
     * Find all active working date overrides (marked as open)
     */
    List<HolidayOverride> findByIsWorkingDateTrue();

    /**
     * Find all overrides within a date range
     */
    List<HolidayOverride> findByHolidayDateBetween(LocalDate startDate, LocalDate endDate);

    /**
     * Find all overrides for a specific holiday UID
     */
    List<HolidayOverride> findByHolidayUid(String holidayUid);

    /**
     * Check if a date has an override
     */
    boolean existsByHolidayDate(LocalDate holidayDate);
}
