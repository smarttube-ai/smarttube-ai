-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
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