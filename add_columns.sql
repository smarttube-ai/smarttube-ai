-- SQL commands to add is_admin and is_banned columns to the profiles table

-- Add is_admin column with default value of false
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add is_banned column with default value of false
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- Comment to explain what each column is used for
COMMENT ON COLUMN profiles.is_admin IS 'Boolean flag indicating if user has admin privileges';
COMMENT ON COLUMN profiles.is_banned IS 'Boolean flag indicating if user is banned from the platform';

-- Check if columns were successfully added
SELECT 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_name = 'profiles' 
  AND column_name IN ('is_admin', 'is_banned'); 