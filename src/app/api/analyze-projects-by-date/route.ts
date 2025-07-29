import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get all projects with their creation dates
    const { data: projects, error } = await supabase
      .from('projects')
      .select('project_id, project_title, status, created_date, updated_at')
      .order('created_date', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message })
    }

    // Group projects by date
    const projectsByDate = projects?.reduce((acc: any, project) => {
      const date = project.created_date?.split('T')[0] || 'unknown'
      if (!acc[date]) {
        acc[date] = {
          count: 0,
          projects: [],
          statuses: {}
        }
      }
      acc[date].count++
      acc[date].projects.push({
        id: project.project_id,
        title: project.project_title.substring(0, 50) + '...',
        status: project.status
      })
      acc[date].statuses[project.status] = (acc[date].statuses[project.status] || 0) + 1
      return acc
    }, {})

    // Get today's date for reference
    const today = new Date().toISOString().split('T')[0]

    // Find dates with bulk imports (more than 10 projects on same day)
    const bulkImportDates = Object.entries(projectsByDate || {})
      .filter(([date, data]: [string, any]) => data.count > 10)
      .map(([date, data]: [string, any]) => ({
        date,
        count: data.count,
        statuses: data.statuses
      }))

    return NextResponse.json({
      totalProjects: projects?.length || 0,
      todaysDate: today,
      dateBreakdown: Object.entries(projectsByDate || {})
        .map(([date, data]: [string, any]) => ({
          date,
          count: data.count,
          statuses: data.statuses,
          sampleProjects: data.projects.slice(0, 3)
        }))
        .sort((a, b) => b.date.localeCompare(a.date)), // Most recent first
      bulkImportDates,
      oldestProject: projects?.[0],
      newestProject: projects?.[projects.length - 1]
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}