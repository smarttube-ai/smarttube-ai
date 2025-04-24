-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create index on role column
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles (role);

-- Create a trigger to assign the free plan to all new users
CREATE OR REPLACE FUNCTION assign_default_plan()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Get the ID of the free plan
  SELECT id INTO free_plan_id FROM plans WHERE name = 'Free' AND price = 0 LIMIT 1;
  
  -- If free plan exists, assign it to the new user
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO user_plans (user_id, plan_id)
    VALUES (NEW.id, free_plan_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add the trigger to assign the free plan when a new user is created
DROP TRIGGER IF EXISTS assign_default_plan_trigger ON auth.users;
CREATE TRIGGER assign_default_plan_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION assign_default_plan();

-- Create a function to check and set a user as admin
CREATE OR REPLACE FUNCTION set_user_as_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  -- Update the user's role to admin
  UPDATE profiles
  SET role = 'admin'
  WHERE id = (
    SELECT id FROM auth.users WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql; 