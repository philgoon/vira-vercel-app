// [C1] API Route: Vendor Portal - Profile Management
// [R-CLERK-7]: Auth via Clerk
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth, isNextResponse } from '@/lib/clerk-auth'

// GET: Fetch vendor profile
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth('vendor')
    if (isNextResponse(authResult)) return authResult

    // Get vendor_id from vendor_users table
    const { data: vendorUser, error: vuError } = await supabaseAdmin
      .from('vendor_users')
      .select('vendor_id')
      .eq('user_id', authResult.profileId)
      .eq('status', 'active')
      .single()

    if (vuError || !vendorUser) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Fetch vendor profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('vendor_id', vendorUser.vendor_id)
      .single()

    if (profileError) {
      throw profileError
    }

    return NextResponse.json({ profile })

  } catch (error) {
    console.error('Error fetching vendor profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Update vendor profile
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth('vendor')
    if (isNextResponse(authResult)) return authResult

    const body = await request.json()

    // Get vendor_id
    const { data: vendorUser, error: vuError } = await supabaseAdmin
      .from('vendor_users')
      .select('vendor_id')
      .eq('user_id', authResult.profileId)
      .eq('status', 'active')
      .single()

    if (vuError || !vendorUser) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Update only allowed fields
    const allowedFields = [
      'vendor_name',
      'primary_contact',
      'phone',
      'website',
      'availability_status',
      'available_from',
      'availability_notes',
      'portfolio_url',
      'sample_work_urls',
      'skills'
    ]

    const updates: any = {}
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    })

    // Update vendor profile
    const { data: profile, error: updateError } = await supabaseAdmin
      .from('vendors')
      .update(updates)
      .eq('vendor_id', vendorUser.vendor_id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ profile })

  } catch (error) {
    console.error('Error updating vendor profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
