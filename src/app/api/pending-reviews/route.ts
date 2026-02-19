import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth, isNextResponse } from '@/lib/clerk-auth'

export async function GET() {
  const authResult = await requireAuth();
  if (isNextResponse(authResult)) return authResult;

  try {
    // [R1]: Get projects without ratings using reliable approach
    // Fetch all projects first
    const { data: allProjects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select(`
        project_id,
        project_title,
        project_description,
        project_type,
        status,
        expected_deadline,
        updated_at,
        client_id,
        vendors (
          vendor_id,
          vendor_name
        )
      `)
      .order('contact_date', { ascending: false })

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
      return NextResponse.json(
        { error: 'Failed to fetch projects', details: projectsError.message },
        { status: 500 }
      )
    }

    // [R1.1]: Get all existing ratings to filter out rated projects
    const { data: existingRatings, error: ratingsError } = await supabaseAdmin
      .from('ratings')
      .select('project_id')

    if (ratingsError) {
      console.error('Error fetching ratings:', ratingsError)
      return NextResponse.json(
        { error: 'Failed to fetch ratings', details: ratingsError.message },
        { status: 500 }
      )
    }

    // [R1.2]: Filter out projects that already have ratings
    const ratedProjectIds = new Set(existingRatings?.map(r => r.project_id) || [])
    const pendingProjects = allProjects?.filter(p => !ratedProjectIds.has(p.project_id)) || []

    return NextResponse.json({
      projects: pendingProjects,
      count: pendingProjects.length
    })

  } catch (error) {
    console.error('Unexpected error in pending-reviews API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
