package com.sanaru.backend.repository;

import com.sanaru.backend.model.Break;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BreakRepository extends JpaRepository<Break, Long> {
    List<Break> findByTimeSlotId(Long timeSlotId);
}
