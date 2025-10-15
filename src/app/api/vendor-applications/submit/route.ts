// [C1] API Route: Submit Vendor Application
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, ...applicationData } = body

    // Create service role client for bypassing RLS
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Validate token
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('vendor_invites')
      .select('*')
      .eq('invite_token', token)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json({
        error: 'Invalid invitation token'
      }, { status: 400 })
    }

    // Check invite status
    if (invite.status !== 'pending') {
      return NextResponse.json({
        error: 'This invitation is no longer valid'
      }, { status: 400 })
    }

    // Check if expired
    const expiresAt = new Date(invite.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json({
        error: 'This invitation has expired'
      }, { status: 400 })
    }

    // Check if application already exists
    const { data: existingApp } = await supabaseAdmin
      .from('vendor_applications')
      .select('application_id')
      .eq('invite_id', invite.invite_id)
      .single()

    if (existingApp) {
      return NextResponse.json({
        error: 'An application has already been submitted'
      }, { status: 400 })
    }

    // Validate required fields
    if (!applicationData.vendor_name) {
      return NextResponse.json({
        error: 'Company name is required'
      }, { status: 400 })
    }

    // Create application
    const { data: application, error: appError } = await supabaseAdmin
      .from('vendor_applications')
      .insert({
        invite_id: invite.invite_id,
        vendor_name: applicationData.vendor_name,
        primary_contact: applicationData.primary_contact || null,
        email: invite.email, // Use email from invite
        phone: applicationData.phone || null,
        website: applicationData.website || null,
        industry: applicationData.industry || null,
        service_category: applicationData.service_category || null,
        skills: applicationData.skills || null,
        pricing_structure: applicationData.pricing_structure || null,
        rate_cost: applicationData.rate_cost || null,
        availability: applicationData.availability || null,
        availability_status: applicationData.availability_status || 'Available',
        available_from: applicationData.available_from || null,
        availability_notes: applicationData.availability_notes || null,
        portfolio_url: applicationData.portfolio_url || null,
        sample_work_urls: applicationData.sample_work_urls || null,
        notes: applicationData.notes || null,
        status: 'pending'
      })
      .select()
      .single()

    if (appError) {
      console.error('Error creating application:', appError)
      return NextResponse.json({
        error: 'Failed to submit application',
        details: appError.message
      }, { status: 500 })
    }

    // Update invite status to accepted
    await supabaseAdmin
      .from('vendor_invites')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('invite_id', invite.invite_id)

    // TODO: Send notification email to admin about new application

    return NextResponse.json({
      success: true,
      application_id: application.application_id,
      message: 'Application submitted successfully'
    })

  } catch (error: any) {
    console.error('Error submitting application:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error?.message || String(error)
    }, { status: 500 })
  }
}
