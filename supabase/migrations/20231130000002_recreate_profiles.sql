-- Drop existing profiles table if it exists
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  role TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_banned BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Delete: Admins can delete any profile
CREATE POLICY "Admins can delete any profile" 
  ON profiles
  FOR DELETE
  TO public
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Update: Admins can update any profile
CREATE POLICY "Admins can update any profile" 
  ON profiles
  FOR UPDATE
  TO public
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Insert: Allow all inserts to profiles
CREATE POLICY "Allow all inserts to profiles" 
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert: Anyone can insert into profiles (duplicate policy, keeping for completeness)
CREATE POLICY "Anyone can insert into profiles" 
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Select: Anyone can read profiles
CREATE POLICY "Anyone can read profiles" 
  ON profiles
  FOR SELECT
  TO public
  USING (true);

-- Update: Users can update own profile
CREATE POLICY "Users can update own profile" 
  ON profiles
  FOR UPDATE
  TO public
  USING (auth.uid() = id);

-- Create or replace trigger to set updated_at on update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN NEW.email = 'mbasam313@gmail.com' THEN 'admin'
      ELSE 'user'
    END,
    CASE 
      WHEN NEW.email = 'mbasam313@gmail.com' THEN true
      ELSE false
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 