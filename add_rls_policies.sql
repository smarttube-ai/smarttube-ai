-- SQL to add Row Level Security policies for INSERT, UPDATE, and DELETE operations

-- Allow inserts of new profiles 
CREATE POLICY "Anyone can create profiles"
ON profiles FOR INSERT
WITH CHECK (true);

-- Allow admins to create/insert any profile
CREATE POLICY "Admins can create any profile"
ON profiles FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = TRUE
  )
);

-- Allow admins to select any profile
CREATE POLICY "Admins can read any profile"
ON profiles FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = TRUE
  )
);

-- Create policy for admins to be able to completely manage all profiles
CREATE POLICY "Admins can do anything"
ON profiles
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = TRUE
  )
);

-- Alternatively, you can disable RLS temporarily for testing
-- IMPORTANT: Only use this in development, not in production!
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Check existing policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  tablename = 'profiles'; 