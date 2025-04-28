-- Insert default feature limits
INSERT INTO feature_limits (key, name, description, default_value) VALUES
('Scripting Tool', 'Scripting Tool', 'Number of scripts that can be generated per month', 7),
('Ideation Tool', 'Ideation Tool', 'Number of ideation sessions per month', 4),
('YouTube Tools', 'YouTube Tools', 'Number of YouTube analyses per month', 12),
('Title Generator', 'Title Generator', 'Number of titles that can be generated per month', 12),
('Description Generator', 'Description Generator', 'Number of descriptions that can be generated per month', 12),
('Hashtag Generator', 'Hashtag Generator', 'Number of hashtag sets that can be generated per month', 15),
('Keyword Ideas', 'Keyword Ideas', 'Number of keyword ideas that can be generated per month', 15),
('Video Hook Generator', 'Video Hook Generator', 'Number of video hooks that can be generated per month', 10),
('Title A/B Tester', 'Title A/B Tester', 'Number of title A/B tests per month', 10),
('Description Optimizer', 'Description Optimizer', 'Number of descriptions that can be optimized per month', 10),
('Support', 'Customer Support Level', '0 = No Support, 1 = Email/Chat, 2 = 24/7 Priority', 0);

-- Insert default plans
INSERT INTO plans (name, price, features, is_active, description) VALUES
('Free', 0, '{
  "Scripting Tool": 7,
  "Ideation Tool": 4,
  "YouTube Tools": 12,
  "Title Generator": 12,
  "Description Generator": 12,
  "Hashtag Generator": 15,
  "Keyword Ideas": 15,
  "Video Hook Generator": 10,
  "Title A/B Tester": 10,
  "Description Optimizer": 10,
  "Support": 0
}', true, 'Get Started with Basic Tools for Content Creation.'),

('Basic', 9.99, '{
  "Scripting Tool": 20,
  "Ideation Tool": 18,
  "YouTube Tools": 30,
  "Title Generator": 40,
  "Description Generator": 40,
  "Hashtag Generator": 50,
  "Keyword Ideas": 50,
  "Video Hook Generator": 40,
  "Title A/B Tester": 40,
  "Description Optimizer": 40,
  "Support": 1
}', true, 'Ideal for Serious Creators Looking for More Tools.'),

('Pro', 29.99, '{
  "Scripting Tool": -1,
  "Ideation Tool": -1,
  "YouTube Tools": -1,
  "Title Generator": -1,
  "Description Generator": -1,
  "Hashtag Generator": -1,
  "Keyword Ideas": -1,
  "Video Hook Generator": -1,
  "Title A/B Tester": -1,
  "Description Optimizer": -1,
  "Support": 2
}', true, 'Best for Professional Creators Needing Unlimited Access.');

-- Create a usage tracking table for feature usage
CREATE TABLE feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create index for faster lookup of usage by user and feature
CREATE INDEX idx_feature_usage_user_feature ON feature_usage(user_id, feature_key);
CREATE INDEX idx_feature_usage_month ON feature_usage(used_at);

-- Enable RLS on feature_usage
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- Admin can see all feature usage
CREATE POLICY admin_all_feature_usage ON feature_usage
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Users can see their own usage
CREATE POLICY view_own_feature_usage ON feature_usage
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own usage entries
CREATE POLICY insert_own_feature_usage ON feature_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create or replace function to check and track feature usage
CREATE OR REPLACE FUNCTION use_feature(feature_key TEXT, metadata JSONB DEFAULT '{}')
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID := auth.uid();
  limit_value INTEGER;
  current_usage INTEGER;
  current_month DATE := date_trunc('month', CURRENT_DATE)::DATE;
BEGIN
  -- Get the user's limit for this feature
  limit_value := get_user_feature_limit(feature_key, user_id);
  
  -- Unlimited usage if limit is -1
  IF limit_value = -1 THEN
    -- Record usage and return true
    INSERT INTO feature_usage (user_id, feature_key, metadata) 
    VALUES (user_id, feature_key, metadata);
    RETURN TRUE;
  END IF;
  
  -- Count current month's usage
  SELECT COUNT(*) INTO current_usage
  FROM feature_usage
  WHERE user_id = use_feature.user_id
    AND feature_key = use_feature.feature_key
    AND used_at >= current_month
    AND used_at < (current_month + INTERVAL '1 month');
    
  -- Check if user has remaining usage
  IF current_usage < limit_value THEN
    -- Record usage and return true
    INSERT INTO feature_usage (user_id, feature_key, metadata) 
    VALUES (user_id, feature_key, metadata);
    RETURN TRUE;
  ELSE
    -- No remaining usage
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get current usage for a feature
CREATE OR REPLACE FUNCTION get_feature_usage(feature_key TEXT, user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  limit_value INTEGER,
  current_usage INTEGER,
  remaining INTEGER,
  is_unlimited BOOLEAN
) AS $$
DECLARE
  limit_val INTEGER;
  usage_count INTEGER;
  current_month DATE := date_trunc('month', CURRENT_DATE)::DATE;
BEGIN
  -- Get the user's limit for this feature
  limit_val := get_user_feature_limit(feature_key, user_id);
  
  -- Count current month's usage
  SELECT COUNT(*) INTO usage_count
  FROM feature_usage
  WHERE user_id = get_feature_usage.user_id
    AND feature_key = get_feature_usage.feature_key
    AND used_at >= current_month
    AND used_at < (current_month + INTERVAL '1 month');
  
  -- Return results
  RETURN QUERY SELECT 
    limit_val,
    usage_count,
    CASE WHEN limit_val = -1 THEN -1 ELSE (limit_val - usage_count) END,
    (limit_val = -1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 