-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  announcement_type TEXT NOT NULL DEFAULT 'bar' CHECK (announcement_type IN ('bar', 'dialog')),
  expiry_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_expiry_date ON announcements(expiry_date);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(announcement_type);

-- Enable RLS on the announcements table
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Admin can do everything with announcements
CREATE POLICY admin_manage_announcements ON announcements
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- All authenticated users can view active announcements
CREATE POLICY view_active_announcements ON announcements
  FOR SELECT
  TO authenticated
  USING (is_active = true AND expiry_date > NOW());

-- Create a get_active_announcements function
CREATE OR REPLACE FUNCTION get_active_announcements()
RETURNS TABLE (
  id UUID,
  title TEXT,
  message TEXT,
  priority TEXT,
  announcement_type TEXT,
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.message,
    a.priority,
    a.announcement_type,
    a.expiry_date,
    a.created_at
  FROM
    announcements a
  WHERE
    a.is_active = true AND
    a.expiry_date > NOW()
  ORDER BY
    CASE a.priority
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 3
      ELSE 4
    END,
    a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create specific functions to get each type of announcement
CREATE OR REPLACE FUNCTION get_bar_announcements()
RETURNS TABLE (
  id UUID,
  title TEXT,
  message TEXT,
  priority TEXT,
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.message,
    a.priority,
    a.expiry_date,
    a.created_at
  FROM
    announcements a
  WHERE
    a.is_active = true AND
    a.expiry_date > NOW() AND
    a.announcement_type = 'bar'
  ORDER BY
    CASE a.priority
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 3
      ELSE 4
    END,
    a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_dialog_announcements()
RETURNS TABLE (
  id UUID,
  title TEXT,
  message TEXT,
  priority TEXT,
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.message,
    a.priority,
    a.expiry_date,
    a.created_at
  FROM
    announcements a
  WHERE
    a.is_active = true AND
    a.expiry_date > NOW() AND
    a.announcement_type = 'dialog'
  ORDER BY
    CASE a.priority
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 3
      ELSE 4
    END,
    a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample announcements data (optional - comment out if not needed)
INSERT INTO announcements (title, message, priority, announcement_type, expiry_date, is_active)
VALUES
  ('Welcome to SmartTube AI', 'We are excited to have you join our platform. Explore our AI tools to enhance your YouTube channel!', 'medium', 'bar', NOW() + INTERVAL '30 days', true),
  ('New Feature: AI Script Generation', 'Check out our new AI-powered script generation tool in the dashboard!', 'high', 'dialog', NOW() + INTERVAL '14 days', true)
ON CONFLICT (id) DO NOTHING; 