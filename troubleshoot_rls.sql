-- Troubleshooting SQL for profiles table RLS issues

-- 1. Check all existing RLS policies for the profiles table
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

-- 2. Check if RLS is enabled on the profiles table
SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM
  pg_class
WHERE
  relname = 'profiles';

-- 3. Temporarily disable RLS on the profiles table (USE WITH CAUTION, ONLY FOR DEVELOPMENT)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Allow all inserts to profiles" ON profiles;

-- 5. Create a new comprehensive policy
CREATE POLICY "Allow all operations on profiles"
ON profiles
USING (true)
WITH CHECK (true);

-- 6. Create a more permissive policy specifically for INSERT
CREATE POLICY "Anyone can insert into profiles"
ON profiles
FOR INSERT
WITH CHECK (true);

-- 7. Verify the changes took effect
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM
  pg_policies
WHERE
  tablename = 'profiles'; 