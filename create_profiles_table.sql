-- SQL commands to create or update the profiles table

-- Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE
);

-- Create trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Create the trigger on the profiles table
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create policies for row level security
-- Allow authenticated users to read all profiles
CREATE POLICY IF NOT EXISTS "Profiles are viewable by authenticated users" 
ON profiles FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow users to update their own profiles
CREATE POLICY IF NOT EXISTS "Users can update their own profiles" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Allow admins to update any profile
CREATE POLICY IF NOT EXISTS "Admins can update any profile" 
ON profiles FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = TRUE
  )
);

-- Allow admins to delete any profile
CREATE POLICY IF NOT EXISTS "Admins can delete any profile" 
ON profiles FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = TRUE
  )
);

-- Enable row level security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verify table structure
SELECT 
  column_name, 
  data_type,
  column_default
FROM 
  information_schema.columns 
WHERE 
  table_name = 'profiles'
ORDER BY ordinal_position; 