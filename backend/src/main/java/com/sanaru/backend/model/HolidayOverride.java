package com.sanaru.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "holiday_overrides")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HolidayOverride {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String holidayUid;  // e.g., "sl_127"

    @Column(nullable = false, unique = true)
    private LocalDate holidayDate;

    @Column(length = 255)
    private String holidaySummary;  // e.g., "Duruthu Full Moon Poya Day"

    @Column(nullable = false)
    private Boolean isWorkingDate = false;  // true = open, false = closed

    @Column(length = 500)
    private String reason;  // Why admin overrode this holiday

    // Custom Hours Fields
    @Column(nullable = false)
    private Boolean useCustomHours = false;  // true = use custom times, false = use normal slots

    @Column
    private LocalTime customStartTime;  // e.g., 11:00

    @Column
    private LocalTime customEndTime;  // e.g., 15:00

    @Column
    private Integer customCapacity;  // Optional: reduce capacity on this day

    // Relationship with User (admin who created the override)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
