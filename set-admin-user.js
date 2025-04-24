// This script sets mbasam313@gmail.com as an admin user
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Ensure we have the required environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  if (!supabaseUrl) console.error('- VITE_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

const ADMIN_EMAIL = 'mbasam313@gmail.com';

async function setAdminUser() {
  console.log(`Setting ${ADMIN_EMAIL} as admin...`);
  try {
    // First, get the user's ID
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(ADMIN_EMAIL);
    
    if (userError) {
      throw userError;
    }
    
    if (!userData?.user) {
      console.log(`User with email ${ADMIN_EMAIL} not found. They need to sign up first.`);
      return;
    }
    
    const userId = userData.user.id;
    console.log(`Found user with ID: ${userId}`);
    
    // Check if user has a profile already
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is the "not found" error
      throw profileError;
    }
    
    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      console.log(`Updated existing profile for ${ADMIN_EMAIL} - set role to admin`);
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: ADMIN_EMAIL,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) throw insertError;
      console.log(`Created new profile for ${ADMIN_EMAIL} with admin role`);
    }
    
    // Verify the role was set
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (verifyError) throw verifyError;
    
    if (verifyProfile.role === 'admin') {
      console.log(`✅ Successfully verified ${ADMIN_EMAIL} has admin role`);
    } else {
      console.log(`⚠️ Warning: Role is set to "${verifyProfile.role}" instead of "admin"`);
    }
    
    console.log('Script completed successfully!');
  } catch (error) {
    console.error('Error setting admin user:', error);
  }
}

setAdminUser(); 