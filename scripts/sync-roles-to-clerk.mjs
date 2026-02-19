// One-off script: Sync user roles from Supabase to Clerk publicMetadata
// Run with: node --env-file=.env.local scripts/sync-roles-to-clerk.mjs

import { createClient } from '@supabase/supabase-js'
import { createClerkClient } from '@clerk/backend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

async function main() {
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('user_id, email, full_name, role, clerk_user_id')
    .not('clerk_user_id', 'is', null)
    .eq('is_active', true)

  if (error) {
    console.error('Failed to fetch users:', error)
    process.exit(1)
  }

  console.log(`Syncing ${users.length} users' roles to Clerk publicMetadata...\n`)

  for (const user of users) {
    try {
      await clerk.users.updateUserMetadata(user.clerk_user_id, {
        publicMetadata: { role: user.role, profileId: user.user_id }
      })
      console.log(`  [OK] ${user.full_name || user.email} -> role: ${user.role}`)
    } catch (err) {
      console.error(`  [FAIL] ${user.email}:`, err.message || err)
    }
  }

  console.log('\nDone.')
}

main()
