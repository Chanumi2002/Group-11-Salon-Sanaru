-- Add delivery-related columns to orders table
-- Script to support delivery address, delivery fee, and delivery status tracking

ALTER TABLE orders ADD COLUMN delivery_address TEXT DEFAULT NULL AFTER status;
ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10, 2) DEFAULT NULL AFTER delivery_address;
ALTER TABLE orders ADD COLUMN requires_delivery BOOLEAN DEFAULT false AFTER delivery_fee;

-- Add index for faster delivery queries
CREATE INDEX idx_orders_requires_delivery ON orders(requires_delivery);
CREATE INDEX idx_orders_status_delivery ON orders(status, requires_delivery);

-- Optional: Update existing orders if needed
-- SET requires_delivery = false WHERE requires_delivery IS NULL;
