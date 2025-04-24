-- Fixed Admin User Setup
-- This migration ensures mbasam313@gmail.com has admin role in the profiles table

-- First update the role in the profiles table (direct approach)
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'mbasam313@gmail.com' OR id IN (
    SELECT id FROM auth.users WHERE email = 'mbasam313@gmail.com'
);

-- If no profile exists yet, create one
INSERT INTO profiles (id, email, role, created_at, updated_at)
SELECT 
    id, 
    email, 
    'admin', 
    NOW(), 
    NOW()
FROM auth.users
WHERE email = 'mbasam313@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Add a function to run this at each server startup to ensure admin access always works
CREATE OR REPLACE FUNCTION ensure_admin_access() RETURNS TRIGGER AS $$
BEGIN
    -- Ensure mbasam313@gmail.com is always set as admin
    UPDATE profiles 
    SET role = 'admin' 
    WHERE email = 'mbasam313@gmail.com' OR id IN (
        SELECT id FROM auth.users WHERE email = 'mbasam313@gmail.com'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that runs periodically to ensure admin access
DROP TRIGGER IF EXISTS ensure_admin_access_trigger ON auth.users;
CREATE TRIGGER ensure_admin_access_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION ensure_admin_access();

-- Log that this migration ran
INSERT INTO _migrations (name, applied_at)
VALUES ('20250410125000_fix_admin.sql', NOW())
ON CONFLICT (name) DO NOTHING; 