-- Add first_name and last_name columns to intake_forms table
ALTER TABLE public.intake_forms 
ADD COLUMN first_name text,
ADD COLUMN last_name text;

-- Update existing records to split name into first_name and last_name where possible
-- This will handle cases where name exists but first_name/last_name are null
UPDATE public.intake_forms 
SET 
  first_name = CASE 
    WHEN position(' ' in name) > 0 THEN split_part(name, ' ', 1)
    ELSE name
  END,
  last_name = CASE 
    WHEN position(' ' in name) > 0 THEN substring(name from position(' ' in name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL AND last_name IS NULL AND name IS NOT NULL;