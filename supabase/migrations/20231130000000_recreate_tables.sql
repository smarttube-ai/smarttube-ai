-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_plans CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS feature_limits CASCADE;

-- Create plans table
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create feature_limits table
CREATE TABLE feature_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  default_value INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_plans table
CREATE TABLE user_plans (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  expiry DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  custom_limits JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_plans_name ON plans(name);
CREATE INDEX idx_plans_is_active ON plans(is_active);
CREATE INDEX idx_feature_limits_key ON feature_limits(key);
CREATE INDEX idx_user_plans_plan_id ON user_plans(plan_id);

-- Set up RLS policies

-- Enable RLS on all tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

-- Plans table policies
-- Admin can do everything
CREATE POLICY admin_all_plans ON plans
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- All users can view active plans
CREATE POLICY view_active_plans ON plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Feature limits policies
-- Admin can do everything
CREATE POLICY admin_all_feature_limits ON feature_limits
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- All users can view feature limits
CREATE POLICY view_feature_limits ON feature_limits
  FOR SELECT
  TO authenticated
  USING (true);

-- User plans policies
-- Admin can do everything
CREATE POLICY admin_all_user_plans ON user_plans
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Users can view their own plan
CREATE POLICY view_own_user_plan ON user_plans
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create or replace get_user_plan function
CREATE OR REPLACE FUNCTION get_user_plan(user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  plan_id UUID,
  plan_name TEXT,
  plan_price NUMERIC,
  plan_features JSONB,
  custom_limits JSONB,
  expiry DATE,
  is_expired BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS plan_id,
    p.name AS plan_name,
    p.price AS plan_price,
    p.features AS plan_features,
    up.custom_limits,
    up.expiry,
    (up.expiry < CURRENT_DATE) AS is_expired
  FROM
    user_plans up
  JOIN
    plans p ON up.plan_id = p.id
  WHERE
    up.user_id = get_user_plan.user_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace get_user_feature_limit function
CREATE OR REPLACE FUNCTION get_user_feature_limit(feature_key TEXT, user_id UUID DEFAULT auth.uid())
RETURNS INTEGER AS $$
DECLARE
  user_limit INTEGER;
  plan_limit INTEGER;
  default_limit INTEGER;
BEGIN
  -- First check if user has a custom limit for this feature
  SELECT 
    (custom_limits->>feature_key)::INTEGER INTO user_limit
  FROM 
    user_plans
  WHERE 
    user_id = get_user_feature_limit.user_id
  LIMIT 1;

  IF user_limit IS NOT NULL THEN
    RETURN user_limit;
  END IF;

  -- Then check if the user's plan has a limit for this feature
  SELECT 
    (p.features->>feature_key)::INTEGER INTO plan_limit
  FROM 
    user_plans up
  JOIN 
    plans p ON up.plan_id = p.id
  WHERE 
    up.user_id = get_user_feature_limit.user_id
  LIMIT 1;

  IF plan_limit IS NOT NULL THEN
    RETURN plan_limit;
  END IF;

  -- Fallback to default value from feature_limits
  SELECT 
    default_value INTO default_limit
  FROM 
    feature_limits
  WHERE 
    key = feature_key
  LIMIT 1;

  RETURN COALESCE(default_limit, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace check_user_feature_limit function
CREATE OR REPLACE FUNCTION check_user_feature_limit(feature_key TEXT, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  limit_value INTEGER;
  usage_count INTEGER;
BEGIN
  -- Get the user's limit for this feature
  limit_value := get_user_feature_limit(feature_key, user_id);
  
  -- Unlimited usage if limit is -1
  IF limit_value = -1 THEN
    RETURN TRUE;
  END IF;

  -- Count current usage from usage tracking table (if implemented)
  -- This is a placeholder - you would need to create a usage tracking table
  -- and implement the logic to count usage for the current period
  -- For now, just return true if limit > 0
  RETURN limit_value > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 