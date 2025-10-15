// [C1] API Route: Validate Vendor Invite Token
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Create service role client for bypassing RLS
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch invite by token
    const { data: invite, error } = await supabaseAdmin
      .from('vendor_invites')
      .select('*')
      .eq('invite_token', token)
      .single()

    if (error || !invite) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 })
    }

    // Check if already used
    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'This invitation has already been used' }, { status: 400 })
    }

    // Check if expired
    const expiresAt = new Date(invite.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 })
    }

    // Check if application already exists
    const { data: existingApp } = await supabaseAdmin
      .from('vendor_applications')
      .select('application_id')
      .eq('invite_id', invite.invite_id)
      .single()

    if (existingApp) {
      return NextResponse.json({ error: 'An application has already been submitted for this invitation' }, { status: 400 })
    }

    return NextResponse.json({
      invite: {
        email: invite.email,
        invite_id: invite.invite_id,
        status: invite.status,
        expires_at: invite.expires_at
      }
    })

  } catch (error) {
    console.error('Error validating invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
