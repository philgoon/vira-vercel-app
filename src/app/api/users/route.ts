// [R-ADMIN] API Route: Fetch Users with Admin Access
import { NextResponse } from 'next/server'
// [RLS-FIX] Use shared supabaseAdmin from lib, matching /api/projects pattern
import { supabaseAdmin } from '@/lib/supabase'
// [R10] Import Mailgun utilities for automated onboarding
import { sendEmail, generateWelcomeEmail } from '@/lib/mailgun'

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

    // Create auth user with password_change_required flag
    // [R10] Set user_metadata flag to force password change on first login
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: full_name?.trim() || null,
        password_change_required: true // Force password change on first login
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

    // [R10] Send welcome email with credentials via Mailgun
    // → needs: user-creation, mailgun-config
    // → provides: automated-onboarding
    const emailTemplate = generateWelcomeEmail({
      email: email.trim(),
      fullName: full_name?.trim() || email.trim(),
      tempPassword,
      role
    })

    const emailResult = await sendEmail({
      to: email.trim(),
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      tags: ['user-onboarding', `role-${role}`]
    })

    if (!emailResult.success) {
      console.warn('Failed to send welcome email:', emailResult.error)
      // Don't fail the request if email fails - user is still created
      // Admin modal will still show password as backup
    } else {
      console.log('Welcome email sent successfully:', emailResult.messageId)
    }

    return NextResponse.json({
      user: profileData,
      tempPassword, // Keep returning for admin modal backup display
      emailSent: emailResult.success
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
