// [C1] API Route: Send Vendor Invite via Mailgun
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Create service role client for bypassing RLS
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Development bypass: Allow if no auth system is set up yet
    const isDevelopment = process.env.NODE_ENV === 'development'
    const skipAuth = isDevelopment && process.env.SKIP_AUTH === 'true'
    
    if (!skipAuth) {
      if (authError || !user) {
        return NextResponse.json({ 
          error: 'Unauthorized',
          hint: 'You must be logged in. Set SKIP_AUTH=true in .env.local for development.'
        }, { status: 401 })
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
    }

    const { email, notes } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if email already has a pending invite
    const { data: existingInvite } = await supabaseAdmin
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
    let inviteToken: string
    try {
      const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_invite_token')
      if (tokenError) {
        // Fallback: generate token in Node.js if function doesn't exist
        inviteToken = crypto.randomBytes(32).toString('hex')
      } else {
        inviteToken = tokenData as string
      }
    } catch {
      // Fallback: generate token in Node.js
      inviteToken = crypto.randomBytes(32).toString('hex')
    }

    // Create invite record using admin client to bypass RLS
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('vendor_invites')
      .insert({
        email,
        invite_token: inviteToken,
        invited_by: user?.id || null,
        notes,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invite:', inviteError)
      return NextResponse.json({ 
        error: 'Failed to create invite',
        details: inviteError.message 
      }, { status: 500 })
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
    formData.append('from', `Single Throw Marketing <noreply@${mailgunDomain}>`)
    formData.append('to', email)
    formData.append('subject', 'Complete Your STM Vendor Application – ViRA Network Invitation')
    formData.append('html', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">You're Invited to Join STM's ViRA Vendor Network</h2>
        
        <p style="color: #333; line-height: 1.6;">Hello,</p>
        
        <p style="color: #333; line-height: 1.6;">
          You've been invited to join <strong>Single Throw Marketing's ViRA Vendor Network</strong> – our centralized platform for managing vendor partnerships.
        </p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #333; font-weight: 600;">Complete your vendor profile to:</p>
          <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
            <li>Track application status in real-time</li>
            <li>Receive project opportunities</li>
            <li>Manage your vendor profile</li>
          </ul>
        </div>
        
        <p style="color: #333; line-height: 1.6;">
          <strong>Next step:</strong> Click below to complete your vendor application (takes ~10 minutes):
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" 
             style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Complete Your Application
          </a>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; font-weight: 600;">Important:</p>
          <ul style="margin: 10px 0; padding-left: 20px; color: #92400e;">
            <li>This invitation expires in 7 days</li>
            <li>You'll need basic company information and service details</li>
            <li>Questions? Contact procurement@singlethrow.com</li>
          </ul>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          If you weren't expecting this invitation or prefer not to work with STM, you can ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #666; font-size: 13px;">
          <strong>Application link:</strong><br>
          <a href="${inviteUrl}" style="color: #2563eb; word-break: break-all;">${inviteUrl}</a>
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          <strong>The STM Team</strong>
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

  } catch (error: any) {
    console.error('Error sending invite:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message || String(error)
    }, { status: 500 })
  }
}
