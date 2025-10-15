import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Mailgun from 'mailgun.js'
import FormData from 'form-data'

const mailgun = new Mailgun(FormData)
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || ''
})

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
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const { invite_id } = await request.json()

    if (!invite_id) {
      return NextResponse.json({ error: 'Invite ID required' }, { status: 400 })
    }

    // Fetch the invite using admin client
    const { data: invite, error: fetchError } = await supabaseAdmin
      .from('vendor_invites')
      .select('*')
      .eq('invite_id', invite_id)
      .single()

    if (fetchError || !invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    // Check if invite can be resent
    if (invite.status === 'accepted') {
      return NextResponse.json({ error: 'Invite already accepted' }, { status: 400 })
    }

    if (invite.status === 'cancelled') {
      return NextResponse.json({ error: 'Invite was cancelled' }, { status: 400 })
    }

    // Generate new expiration date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Update invite with new expiration and reset to pending using admin client
    const { error: updateError } = await supabaseAdmin
      .from('vendor_invites')
      .update({
        status: 'pending',
        expires_at: expiresAt.toISOString()
      })
      .eq('invite_id', invite_id)

    if (updateError) {
      throw updateError
    }

    // Resend email via Mailgun
    const applicationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/vendor/apply/${invite.invite_token}`
    
    await mg.messages.create(process.env.MAILGUN_DOMAIN || '', {
      from: `Single Throw Marketing <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: [invite.email],
      subject: 'Reminder: Complete Your STM Vendor Application',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Reminder: Your STM Vendor Application</h2>
          
          <p style="color: #333; line-height: 1.6;">Hello,</p>
          
          <p style="color: #333; line-height: 1.6;">
            This is a reminder that you've been invited to join <strong>Single Throw Marketing's ViRA Vendor Network</strong>.
          </p>
          
          <p style="color: #333; line-height: 1.6;">
            We haven't received your application yet. Click below to complete it now (takes ~10 minutes):
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${applicationUrl}" 
               style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Complete Your Application
            </a>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-weight: 600;">⏰ Time Sensitive:</p>
            <p style="margin: 10px 0 0 0; color: #92400e;">
              This invitation expires on <strong>${expiresAt.toLocaleDateString()}</strong>
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Questions? Contact procurement@singlethrow.com
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #666; font-size: 13px;">
            <strong>Application link:</strong><br>
            <a href="${applicationUrl}" style="color: #2563eb; word-break: break-all;">${applicationUrl}</a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            <strong>The STM Team</strong>
          </p>
        </div>
      `
    })

    return NextResponse.json({ 
      success: true,
      message: 'Invite resent successfully',
      expires_at: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('Error resending invite:', error)
    return NextResponse.json({ error: 'Failed to resend invite' }, { status: 500 })
  }
}
