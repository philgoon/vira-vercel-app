// [C1] API Route: Approve Vendor Application
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { application_id } = body

    if (!application_id) {
      return NextResponse.json({ error: 'Application ID required' }, { status: 400 })
    }

    // Create service role client
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch the application
    const { data: application, error: appError } = await supabaseAdmin
      .from('vendor_applications')
      .select('*')
      .eq('application_id', application_id)
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.status !== 'pending') {
      return NextResponse.json({ error: 'Application already processed' }, { status: 400 })
    }

    // Get next vendor code
    const nextCodeRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/admin/get-next-vendor-code`)
    const { nextVendorCode } = await nextCodeRes.json()

    // Create vendor record
    const { data: newVendor, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .insert({
        vendor_code: nextVendorCode,
        vendor_name: application.vendor_name,
        email: application.email,
        primary_contact: application.primary_contact,
        phone: application.phone,
        website: application.website,
        industry: application.industry,
        service_categories: application.service_category ? [application.service_category] : [],
        skills: application.skills,
        pricing_structure: application.pricing_structure,
        rate_cost: application.rate_cost,
        availability: application.availability,
        availability_status: application.availability_status || 'Available',
        available_from: application.available_from,
        availability_notes: application.availability_notes,
        portfolio_url: application.portfolio_url,
        sample_work_urls: application.sample_work_urls
      })
      .select()
      .single()

    if (vendorError) {
      console.error('Error creating vendor:', vendorError)
      return NextResponse.json({ 
        error: 'Failed to create vendor', 
        details: vendorError.message 
      }, { status: 500 })
    }

    // Create user account with vendor role
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'
    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.createUser({
      email: application.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: application.primary_contact || application.vendor_name
      }
    })

    if (authUserError) {
      console.error('Error creating auth user:', authUserError)
      // Rollback vendor creation
      await supabaseAdmin.from('vendors').delete().eq('vendor_id', newVendor.vendor_id)
      return NextResponse.json({ 
        error: 'Failed to create user account', 
        details: authUserError.message 
      }, { status: 500 })
    }

    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: authUser.user.id,
        email: application.email,
        full_name: application.primary_contact || application.vendor_name,
        role: 'vendor',
        is_active: true
      })

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      // Rollback vendor and auth user
      await supabaseAdmin.from('vendors').delete().eq('vendor_id', newVendor.vendor_id)
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json({ 
        error: 'Failed to create user profile', 
        details: profileError.message 
      }, { status: 500 })
    }

    // Link vendor and user in vendor_users table
    const { error: linkError } = await supabaseAdmin
      .from('vendor_users')
      .insert({
        vendor_id: newVendor.vendor_id,
        user_id: authUser.user.id,
        status: 'active'
      })

    if (linkError) {
      console.error('Error linking vendor and user:', linkError)
      // Continue anyway - this is not critical
    }

    // Update application status
    const { error: updateError } = await supabaseAdmin
      .from('vendor_applications')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        created_vendor_id: newVendor.vendor_id
      })
      .eq('application_id', application_id)

    if (updateError) {
      console.error('Error updating application:', updateError)
    }

    return NextResponse.json({
      success: true,
      vendor_id: newVendor.vendor_id,
      user_id: authUser.user.id,
      message: 'Application approved successfully'
    })

  } catch (error: any) {
    console.error('Error approving application:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error?.message || String(error)
    }, { status: 500 })
  }
}
