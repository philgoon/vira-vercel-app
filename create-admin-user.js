// Script to create admin user in user_profiles table
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wijtvqriufnyckvhswxq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpanR2cXJpdWZueWNrdmhzd3hxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDU1MTk5NSwiZXhwIjoyMDY2MTI3OTk1fQ.eVGlWvHp-y60gzAnVEuUoclCnph_avJzGbYANzsvS_o';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  console.log('Checking for existing auth users...\n');
  
  // First, list all auth users
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }
  
  console.log(`Found ${users.length} auth user(s):\n`);
  users.forEach(user => {
    console.log(`  - ${user.email} (ID: ${user.id})`);
  });
  
  if (users.length === 0) {
    console.log('\n❌ No auth users found!');
    console.log('Please create a user first in Supabase Dashboard → Authentication → Users');
    return;
  }
  
  console.log('\n--- Creating user_profiles for auth users ---\n');
  
  // Create user_profile for each auth user
  for (const user of users) {
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (existingProfile) {
      console.log(`✅ Profile already exists for ${user.email}`);
      continue;
    }
    
    const { data: newProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        email: user.email,
        full_name: user.email.split('@')[0], // Use email prefix as name
        role: 'admin', // Make them admin
        vendor_id: null,
        is_active: true,
        last_login_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (insertError) {
      console.error(`❌ Error creating profile for ${user.email}:`, insertError);
    } else {
      console.log(`✅ Created admin profile for ${user.email}`);
    }
  }
  
  console.log('\n✅ Done!');
}

createAdminUser().catch(console.error);
