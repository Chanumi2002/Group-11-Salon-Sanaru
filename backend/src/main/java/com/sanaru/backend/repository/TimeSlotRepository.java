package com.sanaru.backend.repository;

import com.sanaru.backend.model.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
    List<TimeSlot> findByDayOfWeekAndIsActiveTrue(DayOfWeek dayOfWeek);

    List<TimeSlot> findByIsActiveTrueOrderByDayOfWeekAscStartTimeAsc();

    Optional<TimeSlot> findByDayOfWeekAndId(DayOfWeek dayOfWeek, Long id);
}
