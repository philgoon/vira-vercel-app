// One-off script: Create Clerk accounts for existing Supabase users
// Run with: node --env-file=.env.local scripts/migrate-users-to-clerk.mjs

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
  // Get users without clerk_user_id
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('user_id, email, full_name, role, clerk_user_id')
    .is('clerk_user_id', null)
    .eq('is_active', true)

  if (error) {
    console.error('Failed to fetch users:', error)
    process.exit(1)
  }

  if (!users || users.length === 0) {
    console.log('No users need migration. All have clerk_user_id set.')
    return
  }

  console.log(`Found ${users.length} users to migrate:\n`)
  for (const u of users) {
    console.log(`  - ${u.full_name || '(no name)'} <${u.email}> [${u.role}]`)
  }
  console.log('')

  for (const user of users) {
    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!'
    const nameParts = (user.full_name || '').trim().split(' ')

    try {
      // Check if Clerk already has this email
      const existing = await clerk.users.getUserList({
        emailAddress: [user.email],
      })

      let clerkUser
      if (existing.data.length > 0) {
        clerkUser = existing.data[0]
        console.log(`[EXISTING] ${user.email} -> Clerk ID: ${clerkUser.id}`)
      } else {
        clerkUser = await clerk.users.createUser({
          emailAddress: [user.email],
          password: tempPassword,
          firstName: nameParts[0] || undefined,
          lastName: nameParts.slice(1).join(' ') || undefined,
          skipPasswordChecks: true,
        })
        console.log(`[CREATED]  ${user.email} -> Clerk ID: ${clerkUser.id}  temp: ${tempPassword}`)
      }

      // Link Clerk ID to Supabase profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ clerk_user_id: clerkUser.id })
        .eq('user_id', user.user_id)

      if (updateError) {
        console.error(`  ERROR linking ${user.email}:`, updateError.message)
      } else {
        console.log(`  Linked ${user.email} to profile ${user.user_id}`)
      }
    } catch (err) {
      console.error(`  FAILED ${user.email}:`, JSON.stringify(err.errors || err.clerkError || err.message || err, null, 2))
    }
  }

  console.log('\nDone.')
}

main()
