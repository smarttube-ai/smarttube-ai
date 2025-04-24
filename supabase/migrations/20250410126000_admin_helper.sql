-- Create helper functions for admin management

-- Function to set a user as admin by email
CREATE OR REPLACE FUNCTION public.set_admin_by_email(email_address TEXT)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
  result TEXT;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO user_id FROM auth.users WHERE email = email_address;
  
  IF user_id IS NULL THEN
    RETURN 'User not found with email: ' || email_address;
  END IF;
  
  -- Check if profile exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    -- Update existing profile
    UPDATE profiles
    SET role = 'admin'
    WHERE id = user_id;
    
    result := 'Updated user profile for ' || email_address || ' to admin role';
  ELSE
    -- Create new profile with admin role
    INSERT INTO profiles (id, email, role, created_at, updated_at)
    VALUES (user_id, email_address, 'admin', NOW(), NOW());
    
    result := 'Created new profile for ' || email_address || ' with admin role';
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(email_address TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin_user BOOLEAN;
BEGIN
  SELECT (role = 'admin') INTO is_admin_user
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE u.email = email_address;
  
  RETURN COALESCE(is_admin_user, false);
END;
$$ LANGUAGE plpgsql;

-- Set mbasam313@gmail.com as admin
SELECT set_admin_by_email('mbasam313@gmail.com'); 