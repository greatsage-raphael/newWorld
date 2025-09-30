
-- Add status column to loading_charge table
ALTER TABLE loading_charge 
ADD COLUMN status TEXT NOT NULL DEFAULT 'In transit';
