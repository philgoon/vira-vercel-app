// Test RLS policies and auth
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wijtvqriufnyckvhswxq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpanR2cXJpdWZueWNrdmhzd3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTE5OTUsImV4cCI6MjA2NjEyNzk5NX0.3H6NZN2K7So6279mkaRTRuql3hzv0VD0YBoqc_56DHE';

async function testAuth() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('Testing authentication and RLS...\n');
  
  // Test 1: Try to read profiles without auth (should be empty due to RLS)
  console.log('Test 1: Reading profiles WITHOUT auth...');
  const { data: noAuthData, error: noAuthError } = await supabase
    .from('user_profiles')
    .select('*');
  
  console.log(`  Result: ${noAuthData?.length || 0} profiles (expected: 0 due to RLS)`);
  if (noAuthError) console.log(`  Error: ${noAuthError.message}`);
  console.log('');
  
  // Test 2: Sign in and try again
  console.log('Test 2: Signing in as cblain@singlethrow.com...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'cblain@singlethrow.com',
    password: 'password123'  // You'll need to provide the actual password
  });
  
  if (authError) {
    console.log(`  ❌ Auth failed: ${authError.message}`);
    console.log('  Note: Replace password123 with actual password in script');
    return;
  }
  
  console.log(`  ✅ Signed in successfully!`);
  console.log(`  User ID: ${authData.user.id}`);
  console.log('');
  
  // Test 3: Read profiles while authenticated
  console.log('Test 3: Reading profiles WITH auth...');
  const { data: authProfileData, error: authProfileError } = await supabase
    .from('user_profiles')
    .select('*');
  
  if (authProfileError) {
    console.log(`  ❌ Error: ${authProfileError.message}`);
  } else {
    console.log(`  ✅ Found ${authProfileData.length} profiles:`);
    authProfileData.forEach(p => console.log(`    - ${p.email} (${p.role})`));
  }
}

testAuth().catch(console.error);
