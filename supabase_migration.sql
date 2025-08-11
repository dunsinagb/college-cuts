-- Add status column to program_cuts table
-- Run this in your Supabase SQL Editor

-- Add the status column
ALTER TABLE program_cuts 
ADD COLUMN status TEXT;

-- Add constraint for valid status values
ALTER TABLE program_cuts 
ADD CONSTRAINT valid_status CHECK (status IN ('confirmed', 'provisional', 'pending', 'proposed', 'under_review', 'cancelled'));

-- Set default status for existing records
UPDATE program_cuts 
SET status = 'confirmed' 
WHERE status IS NULL;

-- Make status NOT NULL
ALTER TABLE program_cuts 
ALTER COLUMN status
SET
NOT NULL; 