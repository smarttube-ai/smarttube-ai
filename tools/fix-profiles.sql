-- This is a SQL script to sync auth users to profiles
-- Run this in the Supabase SQL Editor

-- Sync existing auth users to profiles if they don't exist
INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url',
  created_at
FROM auth.users
WHERE 
  id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Make the first user an admin for convenience
UPDATE public.profiles
SET is_admin = true
WHERE email = (SELECT email FROM auth.users ORDER BY created_at ASC LIMIT 1)
AND is_admin = false;

-- Verify users in profiles
SELECT * FROM public.profiles; 