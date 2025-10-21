// [R-ADMIN] API Route: Fetch Users with Admin Access
import { NextResponse } from 'next/server'
// [RLS-FIX] Use shared supabaseAdmin from lib, matching /api/projects pattern
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Fetch all users using admin client to bypass RLS
    const { data: users, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// [R-ADMIN] Create new user with auth account and profile
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, full_name, role } = body

    // Validation
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!role || !['admin', 'team', 'vendor'].includes(role)) {
      return NextResponse.json({ error: 'Valid role is required (admin, team, vendor)' }, { status: 400 })
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!'

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: full_name?.trim() || null
      }
    })

    if (authError) {
      console.error('Auth user creation failed:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Create user profile
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        email: email.trim(),
        full_name: full_name?.trim() || null,
        role,
        is_active: true
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation failed:', profileError)
      // Rollback: delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
    }

    return NextResponse.json({
      user: profileData,
      tempPassword // Return for admin to share with user
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
