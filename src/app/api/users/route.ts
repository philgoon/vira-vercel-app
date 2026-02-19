// [R-ADMIN] API Route: Fetch Users with Admin Access
// [R-CLERK-8]: User management via Clerk Backend API
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail, generateWelcomeEmail } from '@/lib/mailgun'
import { clerkClient } from '@clerk/nextjs/server'
import { requireAuth, isNextResponse } from '@/lib/clerk-auth'

export async function GET() {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;
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

// [R-CLERK-8] Create new user via Clerk Backend API
export async function POST(request: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  try {
    const body = await request.json()
    const { email, full_name, role } = body

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!role || !['admin', 'team', 'vendor'].includes(role)) {
      return NextResponse.json({ error: 'Valid role is required (admin, team, vendor)' }, { status: 400 })
    }

    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!'

    // Create user in Clerk
    const client = await clerkClient()
    let clerkUser
    try {
      clerkUser = await client.users.createUser({
        emailAddress: [email.trim()],
        password: tempPassword,
        firstName: full_name?.trim()?.split(' ')[0] || undefined,
        lastName: full_name?.trim()?.split(' ').slice(1).join(' ') || undefined,
        skipPasswordChecks: true,
      })
    } catch (err: any) {
      console.error('Clerk user creation failed:', err)
      return NextResponse.json({ error: err.errors?.[0]?.message || err.message }, { status: 400 })
    }

    // Create user profile linked to Clerk ID
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        clerk_user_id: clerkUser.id,
        email: email.trim(),
        full_name: full_name?.trim() || null,
        role,
        is_active: true
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation failed:', profileError)
      await client.users.deleteUser(clerkUser.id)
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

// [R-CLERK-8] Update user role
export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;
  try {
    const body = await request.json()
    const { user_id, role, is_active } = body

    // Validation
    if (!user_id || !user_id.trim()) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // [R-CLERK-POST] Handle is_active toggle
    if (typeof is_active === 'boolean') {
      const { data: updated, error: toggleError } = await supabaseAdmin
        .from('user_profiles')
        .update({ is_active })
        .eq('user_id', user_id)
        .select()
        .single()

      if (toggleError) {
        return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
      }
      return NextResponse.json({ user: updated })
    }

    if (!role || !['admin', 'team', 'vendor'].includes(role)) {
      return NextResponse.json({ error: 'Valid role is required (admin, team, vendor)' }, { status: 400 })
    }

    // Check if this is the last admin user
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('user_id', user_id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If changing FROM admin role, verify there's at least one other admin
    if (currentUser.role === 'admin' && role !== 'admin') {
      const { data: adminUsers, error: adminCheckError } = await supabaseAdmin
        .from('user_profiles')
        .select('user_id')
        .eq('role', 'admin')
        .eq('is_active', true)

      if (adminCheckError) {
        return NextResponse.json({ error: 'Failed to verify admin users' }, { status: 500 })
      }

      if (adminUsers.length <= 1) {
        return NextResponse.json({
          error: 'Cannot change role: at least one admin user must remain'
        }, { status: 400 })
      }
    }

    // Update the role
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ role })
      .eq('user_id', user_id)
      .select()
      .single()

    if (updateError) {
      console.error('Role update failed:', updateError)
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
    }

    return NextResponse.json({ user: updatedUser })

  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// [R-CLERK-8] Resend welcome email with new temporary password
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  try {
    const body = await request.json()
    const { user_id } = body

    if (!user_id || !user_id.trim()) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user profile (user_id here is the profile's user_id or clerk_user_id)
    const { data: userProfile, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('email, full_name, role, clerk_user_id')
      .eq('user_id', user_id)
      .single()

    if (fetchError || !userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!userProfile.clerk_user_id) {
      return NextResponse.json({ error: 'User not yet migrated to Clerk' }, { status: 400 })
    }

    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!'

    // Reset password via Clerk Backend API
    const client = await clerkClient()
    try {
      await client.users.updateUser(userProfile.clerk_user_id, {
        password: tempPassword,
        skipPasswordChecks: true,
      })
    } catch (err: any) {
      console.error('Failed to reset password via Clerk:', err)
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }

    // Send welcome email with new credentials
    const emailTemplate = generateWelcomeEmail({
      email: userProfile.email,
      fullName: userProfile.full_name || userProfile.email,
      tempPassword,
      role: userProfile.role
    })

    const emailResult = await sendEmail({
      to: userProfile.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      tags: ['user-password-reset', `role-${userProfile.role}`]
    })

    if (!emailResult.success) {
      console.warn('Failed to send welcome email:', emailResult.error)
      // Don't fail the request if email fails - password was still reset
    } else {
      console.log('Welcome email resent successfully:', emailResult.messageId)
    }

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      message: 'Password reset and welcome email sent'
    })

  } catch (error) {
    console.error('Error resending welcome email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
