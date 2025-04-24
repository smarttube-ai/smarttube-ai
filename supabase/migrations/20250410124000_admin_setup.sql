-- Set the main admin user
DO $$
BEGIN
  -- Grant admin role to the specified email address
  PERFORM set_user_as_admin('mbasam313@gmail.com');
  
  -- For development purposes, create the admin user if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mbasam313@gmail.com') THEN
    -- Insert admin user into auth.users table if needed
    -- Note: In production, the user should sign up first, then be granted admin role
    -- This is just for development convenience
    INSERT INTO auth.users (
      id,
      email,
      email_confirmed_at,
      created_at,
      updated_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      encrypted_password
    ) VALUES (
      uuid_generate_v4(),
      'mbasam313@gmail.com',
      NOW(),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false,
      -- This is a placeholder. In production, use proper password hashing
      crypt('temporaryPassword123', gen_salt('bf'))
    ) ON CONFLICT (email) DO NOTHING;
    
    -- Create the profile if user was just created
    INSERT INTO profiles (id, user_id, role)
    SELECT id, id, 'admin'
    FROM auth.users
    WHERE email = 'mbasam313@gmail.com'
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
    
    -- Create the user plan with the Pro tier
    WITH pro_plan AS (
      SELECT id FROM plans WHERE name = 'Pro' LIMIT 1
    ),
    admin_user AS (
      SELECT id FROM auth.users WHERE email = 'mbasam313@gmail.com'
    )
    INSERT INTO user_plans (user_id, plan_id, expiry)
    SELECT admin_user.id, pro_plan.id, NOW() + INTERVAL '10 years'
    FROM admin_user, pro_plan
    ON CONFLICT (user_id) DO UPDATE SET 
      plan_id = EXCLUDED.plan_id,
      expiry = EXCLUDED.expiry;
  ELSE
    -- If user already exists, just update the role
    UPDATE profiles
    SET role = 'admin'
    WHERE id IN (SELECT id FROM auth.users WHERE email = 'mbasam313@gmail.com');
  END IF;
END $$; 