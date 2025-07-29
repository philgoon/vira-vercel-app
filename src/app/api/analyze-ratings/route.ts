import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get all ratings
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select('*')
      .order('rating_date', { ascending: false })

    if (ratingsError) {
      return NextResponse.json({ error: ratingsError.message })
    }

    // Get all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('project_id, project_title')

    if (projectsError) {
      return NextResponse.json({ error: projectsError.message })
    }

    // Analyze rating-project connections
    const projectMap = new Map(projects?.map(p => [p.project_id, p.project_title]) || [])
    
    const ratingsWithProjectInfo = ratings?.map(rating => ({
      rating_id: rating.rating_id,
      project_id: rating.project_id,
      project_title: rating.project_id ? (projectMap.get(rating.project_id) || 'PROJECT NOT FOUND') : 'NO PROJECT ID',
      vendor_id: rating.vendor_id,
      rater_email: rating.rater_email,
      rating_date: rating.rating_date,
      overall_rating: rating.vendor_overall_rating
    })) || []

    // Count ratings with and without project connections
    const ratingsWithProjects = ratings?.filter(r => r.project_id && projectMap.has(r.project_id)).length || 0
    const ratingsWithoutProjects = ratings?.filter(r => !r.project_id).length || 0
    const ratingsWithInvalidProjects = ratings?.filter(r => r.project_id && !projectMap.has(r.project_id)).length || 0

    // Get unique rater emails to identify imported vs user-created
    const raterEmails = [...new Set(ratings?.map(r => r.rater_email) || [])]

    return NextResponse.json({
      totalRatings: ratings?.length || 0,
      ratingsWithProjects,
      ratingsWithoutProjects,
      ratingsWithInvalidProjects,
      raterEmails,
      sampleRatings: ratingsWithProjectInfo.slice(0, 10),
      totalProjects: projects?.length || 0,
      importedRatings: ratings?.filter(r => r.rater_email === 'imported@system.com').length || 0
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}