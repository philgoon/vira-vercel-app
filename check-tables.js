// Quick script to check what tables exist in Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wijtvqriufnyckvhswxq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpanR2cXJpdWZueWNrdmhzd3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTE5OTUsImV4cCI6MjA2NjEyNzk5NX0.3H6NZN2K7So6279mkaRTRuql3hzv0VD0YBoqc_56DHE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking Supabase tables...\n');
  
  const tablesToCheck = [
    'vendors',
    'vendors_enhanced',
    'vendor_performance',
    'projects',
    'projects_consolidated',
    'clients',
    'user_profiles'
  ];
  
  for (const table of tablesToCheck) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ ${table}: Does NOT exist (${error.message})`);
    } else {
      console.log(`✅ ${table}: Exists (${count} rows)`);
    }
  }
}

checkTables().catch(console.error);
