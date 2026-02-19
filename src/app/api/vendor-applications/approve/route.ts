// [C1] API Route: Approve Vendor Application
// [R-CLERK-7]: Auth via Clerk
// [R-CLERK-8]: User creation via Clerk Backend API
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth, isNextResponse } from '@/lib/clerk-auth'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  const authResult = await requireAuth('admin')
  if (isNextResponse(authResult)) return authResult

  try {
    const body = await request.json()
    const { application_id } = body

    if (!application_id) {
      return NextResponse.json({ error: 'Application ID required' }, { status: 400 })
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

    // Create user account in Clerk
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'
    const client = await clerkClient()
    let clerkUser
    try {
      clerkUser = await client.users.createUser({
        emailAddress: [application.email],
        password: tempPassword,
        firstName: (application.primary_contact || application.vendor_name)?.split(' ')[0],
        lastName: (application.primary_contact || application.vendor_name)?.split(' ').slice(1).join(' ') || undefined,
        skipPasswordChecks: true,
      })
    } catch (err: any) {
      console.error('Error creating Clerk user:', err)
      await supabaseAdmin.from('vendors').delete().eq('vendor_id', newVendor.vendor_id)
      return NextResponse.json({
        error: 'Failed to create user account',
        details: err.errors?.[0]?.message || err.message
      }, { status: 500 })
    }

    // Create user profile linked to Clerk ID
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        clerk_user_id: clerkUser.id,
        email: application.email,
        full_name: application.primary_contact || application.vendor_name,
        role: 'vendor',
        is_active: true
      })

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      await supabaseAdmin.from('vendors').delete().eq('vendor_id', newVendor.vendor_id)
      await client.users.deleteUser(clerkUser.id)
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
        user_id: clerkUser.id,
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
        reviewed_by: authResult.userId,
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
      user_id: clerkUser.id,
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
