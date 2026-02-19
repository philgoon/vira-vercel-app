// [C1] API Route: Vendor Portal - Ratings View
// [R-CLERK-7]: Auth via Clerk
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth, isNextResponse } from '@/lib/clerk-auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth('vendor')
    if (isNextResponse(authResult)) return authResult
    const { userId } = authResult

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
