// Check user_profiles in detail
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wijtvqriufnyckvhswxq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpanR2cXJpdWZueWNrdmhzd3hxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDU1MTk5NSwiZXhwIjoyMDY2MTI3OTk1fQ.eVGlWvHp-y60gzAnVEuUoclCnph_avJzGbYANzsvS_o';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfiles() {
  console.log('Checking user_profiles table...\n');
  
  const { data: profiles, error, count } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Total profiles: ${count}\n`);
  
  if (profiles && profiles.length > 0) {
    profiles.forEach(profile => {
      console.log('Profile:');
      console.log(`  - Email: ${profile.email}`);
      console.log(`  - Role: ${profile.role}`);
      console.log(`  - Active: ${profile.is_active}`);
      console.log(`  - User ID: ${profile.user_id}`);
      console.log('');
    });
  } else {
    console.log('No profiles found!');
  }
}

checkProfiles().catch(console.error);
