
-- Add new columns to store offloading details
ALTER TABLE loading_charge 
ADD COLUMN offloading_location JSONB,
ADD COLUMN offloading_photo TEXT;
