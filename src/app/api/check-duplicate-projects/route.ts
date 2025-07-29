import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get all remaining projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('project_id, project_title, client_id, status, created_date')
      .order('project_title')

    if (error) {
      return NextResponse.json({ error: error.message })
    }

    // Find duplicates by project title
    const titleMap = new Map<string, any[]>()
    
    projects?.forEach(project => {
      const normalizedTitle = project.project_title.trim().toLowerCase()
      if (!titleMap.has(normalizedTitle)) {
        titleMap.set(normalizedTitle, [])
      }
      titleMap.get(normalizedTitle)?.push(project)
    })

    // Filter to only show duplicates
    const duplicates = Array.from(titleMap.entries())
      .filter(([title, projects]) => projects.length > 1)
      .map(([title, projects]) => ({
        title: projects[0].project_title,
        count: projects.length,
        projects: projects.map(p => ({
          id: p.project_id,
          client_id: p.client_id,
          status: p.status,
          created: p.created_date
        }))
      }))

    // Get exact count check
    const uniqueTitles = titleMap.size
    const totalProjects = projects?.length || 0

    return NextResponse.json({
      totalProjects,
      uniqueTitles,
      duplicateGroups: duplicates.length,
      totalDuplicateProjects: duplicates.reduce((sum, group) => sum + group.count, 0),
      duplicates: duplicates.slice(0, 10), // Show first 10 duplicate groups
      expectedProjects: 85,
      extraProjects: totalProjects - 85
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}