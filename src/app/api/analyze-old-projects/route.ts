import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get projects that are NOT from the recent import (project_id < PRJ-0327)
    const { data: oldProjects, error: projectError } = await supabase
      .from('projects')
      .select('project_id, project_title, status, created_date')
      .lt('project_id', 'PRJ-0327') // First imported project
      .order('project_id')

    if (projectError) {
      return NextResponse.json({ error: projectError.message })
    }

    // Check how many of these old projects have ratings
    let projectsWithRatings = 0
    let totalRatings = 0

    for (const project of oldProjects || []) {
      const { count } = await supabase
        .from('ratings')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.project_id)
      
      if (count && count > 0) {
        projectsWithRatings++
        totalRatings += count
      }
    }

    return NextResponse.json({
      oldProjectCount: oldProjects?.length || 0,
      oldProjectsWithRatings: projectsWithRatings,
      totalRatingsAffected: totalRatings,
      statusBreakdown: oldProjects?.reduce((acc: any, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1
        return acc
      }, {}),
      sampleProjects: oldProjects?.slice(0, 5).map(p => ({
        id: p.project_id,
        title: p.project_title,
        status: p.status
      }))
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}