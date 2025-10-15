// [C1] API Route: Vendor Portal - Ratings View
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

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

    // Fetch vendor ratings from projects
    const { data: projects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select('overall_rating')
      .eq('vendor_id', vendorUser.vendor_id)
      .not('overall_rating', 'is', null)

    if (projectsError) {
      throw projectsError
    }

    // Calculate ratings
    const total_projects = projects.length
    const average_rating = total_projects > 0
      ? projects.reduce((sum, p) => sum + (p.overall_rating || 0), 0) / total_projects
      : 0

    const ratings = {
      total_projects,
      average_rating,
      ratings_by_category: {
        quality: 0,
        communication: 0,
        timeliness: 0,
        value: 0
      },
      recent_feedback: []
    }

    return NextResponse.json({ ratings })

  } catch (error) {
    console.error('Error fetching vendor ratings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
