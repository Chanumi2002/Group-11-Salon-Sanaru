-- Create Holiday Overrides Table
-- This table stores admin overrides for system holidays, allowing them to mark holidays as working dates
-- with optional custom operating hours

CREATE TABLE IF NOT EXISTS holiday_overrides (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    holiday_uid VARCHAR(50) NOT NULL,           -- Reference to system holiday ID (e.g., "sl_127")
    holiday_date DATE NOT NULL,                 -- The specific date being overridden
    holiday_summary VARCHAR(255),               -- Copy of holiday name for display
    is_working_date BOOLEAN DEFAULT false,      -- true = open, false = closed by admin
    reason VARCHAR(500),                        -- Admin notes about why it was overridden
    
    -- Custom Hours Fields
    use_custom_hours BOOLEAN DEFAULT false,     -- true = use custom hours, false = use normal slots
    custom_start_time TIME,                     -- Custom opening time (e.g., 11:00:00)
    custom_end_time TIME,                       -- Custom closing time (e.g., 15:00:00)
    custom_capacity INT,                        -- Optional reduced capacity for the day
    
    -- Audit Fields
    created_by BIGINT,                          -- Admin user ID who created the override
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE KEY uk_holiday_date (holiday_date),
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for faster queries
CREATE INDEX idx_holiday_date ON holiday_overrides(holiday_date);
CREATE INDEX idx_is_working_date ON holiday_overrides(is_working_date);
CREATE INDEX idx_created_by ON holiday_overrides(created_by);
