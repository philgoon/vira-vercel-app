// [R-CLERK-4]: Profile lookup by Clerk user ID - used by useViRAAuth hook
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clerkUserId = searchParams.get('clerk_user_id')

  if (!clerkUserId) {
    return NextResponse.json({ error: 'clerk_user_id required' }, { status: 400 })
  }

  const { data: profile, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (!error && profile) {
    return NextResponse.json({ profile })
  }

  // [R-CLERK-9]: Email fallback — auto-link existing users on first Clerk login
  try {
    console.log('[profile] clerk_user_id lookup missed, trying email fallback for:', clerkUserId)
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(clerkUserId)
    const email = clerkUser.emailAddresses[0]?.emailAddress
    console.log('[profile] Clerk user email:', email)

    if (email) {
      const { data: emailProfile, error: emailError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single()

      console.log('[profile] Email lookup result:', emailProfile ? 'found' : 'not found', emailError?.message)

      if (emailProfile) {
        const { error: updateError } = await supabaseAdmin
          .from('user_profiles')
          .update({ clerk_user_id: clerkUserId })
          .eq('user_id', emailProfile.user_id)

        console.log('[profile] Auto-link result:', updateError ? updateError.message : 'success')
        return NextResponse.json({ profile: { ...emailProfile, clerk_user_id: clerkUserId } })
      }
    }
  } catch (err) {
    console.error('[profile] Email fallback failed:', err)
  }

  return NextResponse.json({ profile: null }, { status: 200 })
}

// POST: Bootstrap first admin, or self-provision if invited
export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if profile already exists
  const { data: existing } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id')
    .eq('clerk_user_id', userId)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Profile already exists' }, { status: 409 })
  }

  // Count existing profiles - if zero, bootstrap as first admin
  const { count } = await supabaseAdmin
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })

  if (count !== 0) {
    return NextResponse.json({ error: 'Access pending admin approval' }, { status: 403 })
  }

  // No profiles exist - bootstrap first admin from Clerk user data
  const client = await clerkClient()
  const clerkUser = await client.users.getUser(userId)
  const email = clerkUser.emailAddresses[0]?.emailAddress
  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null

  const { data: profile, error: insertError } = await supabaseAdmin
    .from('user_profiles')
    .insert({ clerk_user_id: userId, email, full_name: fullName, role: 'admin', is_active: true })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }

  return NextResponse.json({ profile })
}
