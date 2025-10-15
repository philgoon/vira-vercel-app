// [C1] API Route: Vendor Portal - Profile Management
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// GET: Fetch vendor profile
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is vendor
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!userProfile || userProfile.role !== 'vendor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create service role client
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get vendor_id from vendor_users table
    const { data: vendorUser, error: vuError } = await supabaseAdmin
      .from('vendor_users')
      .select('vendor_id')
      .eq('user_id', user.id)
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
    const supabase = await createClient()
    const body = await request.json()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is vendor
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!userProfile || userProfile.role !== 'vendor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create service role client
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get vendor_id
    const { data: vendorUser, error: vuError } = await supabaseAdmin
      .from('vendor_users')
      .select('vendor_id')
      .eq('user_id', user.id)
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
