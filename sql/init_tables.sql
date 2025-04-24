-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- PLANS TABLE
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  features JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER_PLANS TABLE
CREATE TABLE IF NOT EXISTS user_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  custom_limits JSONB DEFAULT NULL,
  expiry DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FEATURE_LIMITS TABLE
CREATE TABLE IF NOT EXISTS feature_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  default_value INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('paid', 'failed', 'cancelled', 'pending')),
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Ensure only one row
  maintenance_mode BOOLEAN DEFAULT FALSE,
  banner_message TEXT DEFAULT '',
  banner_enabled BOOLEAN DEFAULT FALSE,
  support_email TEXT DEFAULT '',
  max_upload_size INTEGER DEFAULT 5,
  stripe_pk TEXT DEFAULT '',
  stripe_sk TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_active BOOLEAN DEFAULT TRUE,
  expiry_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER PERMISSIONS FUNCTION
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SELECT is_admin INTO result FROM profiles WHERE id = user_id;
  RETURN COALESCE(result, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS POLICIES

-- Plans policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for active plans" ON plans
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can do everything" ON plans
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- User plans policies
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own plans" ON user_plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can do everything on user_plans" ON user_plans
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Feature limits policies
ALTER TABLE feature_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view feature limits" ON feature_limits
  FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage feature limits" ON feature_limits
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Payments policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can do everything on payments" ON payments
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Settings policies
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view settings" ON settings
  FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage settings" ON settings
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Announcements policies
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view active non-expired announcements" ON announcements
  FOR SELECT USING (is_active = TRUE AND expiry_date >= CURRENT_DATE);
CREATE POLICY "Admins can manage announcements" ON announcements
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Create default admin for testing (replace with actual admin email)
INSERT INTO profiles (id, email, full_name, is_admin)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'Admin User', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Create default plans
INSERT INTO plans (name, price, features, is_active)
VALUES 
  ('Free', 0, '{"ideas":5,"seo":2}', TRUE),
  ('Basic', 9.99, '{"ideas":20,"seo":10}', TRUE),
  ('Pro', 29.99, '{"ideas":50,"seo":30}', TRUE)
ON CONFLICT DO NOTHING;

-- Create default feature limits
INSERT INTO feature_limits (key, name, description, default_value)
VALUES 
  ('ideas', 'Video Ideas', 'Number of video ideas per day', 5),
  ('seo', 'SEO Reports', 'Number of SEO reports per week', 2),
  ('keywords', 'Keyword Research', 'Number of keyword research requests per day', 3)
ON CONFLICT DO NOTHING; 