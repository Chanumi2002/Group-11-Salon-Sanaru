package com.sanaru.backend.repository;

import com.sanaru.backend.model.ClosedDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClosedDateRepository extends JpaRepository<ClosedDate, Long> {
    List<ClosedDate> findByIsActiveTrue();
    Optional<ClosedDate> findByClosedDate(LocalDate closedDate);
    List<ClosedDate> findByClosedDateBetween(LocalDate startDate, LocalDate endDate);
}
