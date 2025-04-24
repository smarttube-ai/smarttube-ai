-- Create the plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create indexes on plans table
CREATE INDEX IF NOT EXISTS plans_name_idx ON plans (name);
CREATE INDEX IF NOT EXISTS plans_price_idx ON plans (price);
CREATE INDEX IF NOT EXISTS plans_is_active_idx ON plans (is_active);

-- Create the user_plans table
CREATE TABLE IF NOT EXISTS user_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  expiry DATE,
  custom_limits JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Create indexes on user_plans table
CREATE INDEX IF NOT EXISTS user_plans_user_id_idx ON user_plans (user_id);
CREATE INDEX IF NOT EXISTS user_plans_plan_id_idx ON user_plans (plan_id);
CREATE INDEX IF NOT EXISTS user_plans_expiry_idx ON user_plans (expiry);

-- Add RLS policies for plans table
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Everyone can view active plans
CREATE POLICY "Everyone can view active plans" ON plans
  FOR SELECT USING (is_active = true);

-- Only admins can manage plans
CREATE POLICY "Admins can manage plans" ON plans
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE role = 'admin'
    )
  );

-- Add RLS policies for user_plans table
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

-- Users can view their own plan
CREATE POLICY "Users can view their own plan" ON user_plans
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all user plans
CREATE POLICY "Admins can manage all user plans" ON user_plans
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE role = 'admin'
    )
  );

-- Create function to update updated_at on update
CREATE OR REPLACE FUNCTION update_user_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on update
CREATE TRIGGER update_user_plans_updated_at
BEFORE UPDATE ON user_plans
FOR EACH ROW
EXECUTE FUNCTION update_user_plans_updated_at();

-- Insert default plans
INSERT INTO plans (name, price, features, is_active)
VALUES 
  ('Free', 0, '{"video_ideas": 3, "seo": 1}', true),
  ('Basic', 9.99, '{"video_ideas": 10, "seo": 5, "content_generation": 10}', true),
  ('Pro', 29.99, '{"video_ideas": 50, "seo": 25, "content_generation": 50, "advanced_analytics": 1}', true);

-- Create or update feature_limits table if not created yet
CREATE TABLE IF NOT EXISTS feature_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  default_value INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for feature_limits
ALTER TABLE feature_limits ENABLE ROW LEVEL SECURITY;

-- Everyone can view feature limits
CREATE POLICY "Everyone can view feature limits" ON feature_limits
  FOR SELECT USING (true);

-- Only admins can manage feature limits
CREATE POLICY "Admins can manage feature limits" ON feature_limits
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE role = 'admin'
    )
  );

-- Insert default feature limits
INSERT INTO feature_limits (key, name, description, default_value)
VALUES 
  ('video_ideas', 'Video Ideas', 'Number of video ideas you can generate per day', 3),
  ('seo', 'SEO Analysis', 'Number of SEO analyses you can perform per day', 1),
  ('content_generation', 'Content Generation', 'Number of content pieces you can generate per day', 0),
  ('advanced_analytics', 'Advanced Analytics', 'Access to advanced analytics (1 = enabled, 0 = disabled)', 0)
ON CONFLICT (key) DO NOTHING; 