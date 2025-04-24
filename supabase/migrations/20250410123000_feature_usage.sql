-- Create feature_usage table to track usage of features
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_reset DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, feature)
);

-- Add RLS policies
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage
CREATE POLICY "Users can read their own feature usage" ON feature_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own usage (though this is usually done server-side)
CREATE POLICY "Users can update their own feature usage" ON feature_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Only the service role and the user can insert their own usage
CREATE POLICY "Users can insert their own feature usage" ON feature_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can see all usage
CREATE POLICY "Admins can read all feature usage" ON feature_usage
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Create index on user_id and feature
CREATE INDEX IF NOT EXISTS feature_usage_user_id_feature_idx ON feature_usage (user_id, feature);

-- Create function to update updated_at on update
CREATE OR REPLACE FUNCTION update_feature_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on update
CREATE TRIGGER update_feature_usage_updated_at
BEFORE UPDATE ON feature_usage
FOR EACH ROW
EXECUTE FUNCTION update_feature_usage_updated_at(); 