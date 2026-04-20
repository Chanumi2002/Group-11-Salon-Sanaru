-- Migration to create breaks table for lunch breaks and other breaks
-- This allows admins to define break periods within time slots

CREATE TABLE IF NOT EXISTS breaks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    time_slot_id BIGINT NOT NULL,
    break_name VARCHAR(100) NOT NULL,
    start_time TIME(0) NOT NULL,
    end_time TIME(0) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE,
    INDEX idx_breaks_time_slot (time_slot_id),
    CONSTRAINT check_break_times CHECK (start_time < end_time)
);
