-- Complete SQL to recreate the profiles table and set up RLS policies
-- Run this in your Supabase SQL Editor

-- First, drop the existing table if it exists
DROP TABLE IF EXISTS profiles;

-- Create the profiles table with all required columns
CREATE TABLE profiles (
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

-- Create the trigger on the profiles table
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- 1. Allow anyone to insert into profiles
CREATE POLICY "Anyone can insert into profiles"
ON profiles
FOR INSERT
WITH CHECK (true);

-- 2. Allow users to read all profiles
CREATE POLICY "Anyone can read profiles"
ON profiles
FOR SELECT
USING (true);

-- 3. Allow users to update their own profiles
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- 4. Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
ON profiles
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = TRUE
  )
);

-- 5. Allow admins to delete any profile
CREATE POLICY "Admins can delete any profile"
ON profiles
FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = TRUE
  )
);

-- Create an initial admin user (optional - uncomment if needed)
-- INSERT INTO profiles (id, email, full_name, created_at, is_admin)
-- VALUES 
--   ('YOUR-AUTH-USER-ID', 'admin@example.com', 'Admin User', NOW(), TRUE);

-- Verify the table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Verify policies
SELECT
  tablename,
  policyname,
  permissive,
  cmd
FROM
  pg_policies
WHERE
  tablename = 'profiles'; 