// [C1] API Route: Send Vendor Invite via Mailgun
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { email, notes } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if email already has a pending invite
    const { data: existingInvite } = await supabase
      .from('vendor_invites')
      .select('invite_id, status')
      .eq('email', email)
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      return NextResponse.json({ 
        error: 'This email already has a pending invite' 
      }, { status: 400 })
    }

    // Generate invite token
    const { data: tokenData } = await supabase.rpc('generate_invite_token')
    const inviteToken = tokenData as string

    // Create invite record
    const { data: invite, error: inviteError } = await supabase
      .from('vendor_invites')
      .insert({
        email,
        invite_token: inviteToken,
        invited_by: user.id,
        notes,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invite:', inviteError)
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    // Send email via Mailgun
    const mailgunDomain = process.env.MAILGUN_DOMAIN
    const mailgunApiKey = process.env.MAILGUN_API_KEY
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

    if (!mailgunDomain || !mailgunApiKey) {
      console.error('Mailgun not configured')
      return NextResponse.json({ 
        error: 'Email service not configured',
        invite // Return invite anyway for testing
      }, { status: 500 })
    }

    const inviteUrl = `${appUrl}/vendor/apply/${inviteToken}`

    const formData = new FormData()
    formData.append('from', `ViRA <noreply@${mailgunDomain}>`)
    formData.append('to', email)
    formData.append('subject', 'Invitation to Join ViRA Vendor Network')
    formData.append('html', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">You're Invited to Join ViRA</h2>
        <p>Hello,</p>
        <p>You've been invited to join the ViRA Vendor Network. We'd love to have you on board!</p>
        <p>Click the button below to complete your application:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Complete Your Application
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          This invitation will expire in 7 days.<br>
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link: <a href="${inviteUrl}">${inviteUrl}</a>
        </p>
      </div>
    `)

    const mailgunResponse = await fetch(
      `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${mailgunApiKey}`).toString('base64')}`
        },
        body: formData
      }
    )

    if (!mailgunResponse.ok) {
      const errorText = await mailgunResponse.text()
      console.error('Mailgun error:', errorText)
      return NextResponse.json({ 
        error: 'Failed to send email',
        invite // Return invite anyway
      }, { status: 500 })
    }

    const mailgunData = await mailgunResponse.json()
    console.log('Email sent:', mailgunData)

    return NextResponse.json({ 
      success: true,
      invite,
      message: 'Invite sent successfully'
    })

  } catch (error) {
    console.error('Error sending invite:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
