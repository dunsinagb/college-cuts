-- Add status column to program_cuts table
-- Run this in your Supabase SQL Editor

-- First, let's check what table the v_latest_cuts view is based on
-- (This is likely program_cuts or similar)

-- Add the status column with a default value
ALTER TABLE program_cuts 
ADD COLUMN
IF NOT EXISTS status TEXT CHECK
(status IN
('confirmed', 'provisional', 'pending', 'proposed', 'under_review', 'cancelled'));

-- Set a default status for existing records
UPDATE program_cuts 
SET status = 'confirmed' 
WHERE status IS NULL;

-- Make the status column NOT NULL after setting defaults
ALTER TABLE program_cuts 
ALTER COLUMN status
SET
NOT NULL;

-- Update the view to include the status column
-- (You may need to recreate the v_latest_cuts view)
DROP VIEW IF EXISTS v_latest_cuts;

CREATE VIEW v_latest_cuts
AS
    SELECT
        id,
        institution,
        program_name,
        state,
        cut_type,
        announcement_date,
        effective_term,
        students_affected,
        faculty_affected,
        control,
        notes,
        source_url,
        source_publication,
        status,
        created_at,
        updated_at
    FROM program_cuts
    ORDER BY announcement_date DESC;

-- Grant permissions on the view
GRANT SELECT ON v_latest_cuts TO anon;
GRANT SELECT ON v_latest_cuts TO authenticated; 