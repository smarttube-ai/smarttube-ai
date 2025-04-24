-- Simple SQL script to recreate profiles table with proper permissions

-- Drop existing table
DROP TABLE IF EXISTS profiles;

-- Create new profiles table
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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create the essential INSERT policy
CREATE POLICY "Allow all inserts to profiles"
ON profiles FOR INSERT
WITH CHECK (true);

-- Policy to allow reading profiles
CREATE POLICY "Allow all selects on profiles"
ON profiles FOR SELECT
USING (true); 