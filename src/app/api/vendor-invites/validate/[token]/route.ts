// [C1] API Route: Validate Vendor Invite Token
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

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
      return NextResponse.json({
        valid: false,
        error: 'Invitation not found'
      }, { status: 404 })
    }

    // Check if already accepted
    if (invite.status === 'accepted') {
      return NextResponse.json({
        valid: false,
        error: 'This invitation has already been used'
      }, { status: 400 })
    }

    // Check if cancelled
    if (invite.status === 'cancelled') {
      return NextResponse.json({
        valid: false,
        error: 'This invitation has been cancelled'
      }, { status: 400 })
    }

    // Check if expired
    const expiresAt = new Date(invite.expires_at)
    if (expiresAt < new Date()) {
      // Update status to expired
      await supabaseAdmin
        .from('vendor_invites')
        .update({ status: 'expired' })
        .eq('invite_id', invite.invite_id)

      return NextResponse.json({
        valid: false,
        error: 'This invitation has expired'
      }, { status: 400 })
    }

    // Check if application already exists
    const { data: existingApp } = await supabaseAdmin
      .from('vendor_applications')
      .select('application_id, status')
      .eq('invite_id', invite.invite_id)
      .single()

    if (existingApp) {
      return NextResponse.json({
        valid: false,
        error: 'An application has already been submitted for this invitation'
      }, { status: 400 })
    }

    // Valid invite!
    return NextResponse.json({
      valid: true,
      email: invite.email,
      expires_at: invite.expires_at
    })

  } catch (error) {
    console.error('Error validating invite:', error)
    return NextResponse.json({
      valid: false,
      error: 'Failed to validate invitation'
    }, { status: 500 })
  }
}
