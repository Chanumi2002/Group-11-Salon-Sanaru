-- Migration to add appointment duration field to time_slots table
-- This allows admins to set appointment durations (30 min, 45 min, 60 min, 90 min, etc.)

ALTER TABLE time_slots 
ADD COLUMN appointment_duration INT NOT NULL DEFAULT 30 AFTER capacity;

-- Create index for better query performance
CREATE INDEX idx_time_slots_duration ON time_slots(appointment_duration);

-- Add constraint to ensure valid duration values
ALTER TABLE time_slots 
ADD CONSTRAINT check_valid_duration CHECK (appointment_duration IN (15, 30, 45, 60, 90, 120));
