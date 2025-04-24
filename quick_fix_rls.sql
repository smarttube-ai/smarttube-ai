-- Quick fix for RLS issues - Choose ONE of these options:

-- OPTION 1: Create a broad insert policy that allows creating any profile (simplest)
CREATE POLICY "Allow all inserts to profiles"
ON profiles FOR INSERT
WITH CHECK (true);

-- OPTION 2: Temporarily disable RLS on the profiles table (use only in development)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- OPTION 3: Create a row-level security bypass for the service role
-- This will allow your application to bypass RLS when using the service_role key
-- Note: The service_role key should never be exposed to client-side code 