import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE() {
  try {
    // First, check what we're about to delete
    const { data: projectsToDelete, error: checkError } = await supabase
      .from('projects')
      .select('project_id, project_title, status')
      .eq('created_date', '2025-01-01')
      .order('project_id')

    if (checkError) {
      return NextResponse.json({ error: checkError.message })
    }

    // Check for associated ratings that would be orphaned
    let ratingsToDelete = 0
    for (const project of projectsToDelete || []) {
      const { count } = await supabase
        .from('ratings')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.project_id)
      
      ratingsToDelete += count || 0
    }

    // Delete associated ratings first
    if (ratingsToDelete > 0) {
      const projectIds = projectsToDelete?.map(p => p.project_id) || []
      const { error: ratingsError } = await supabase
        .from('ratings')
        .delete()
        .in('project_id', projectIds)

      if (ratingsError) {
        return NextResponse.json({ 
          error: `Failed to delete associated ratings: ${ratingsError.message}` 
        })
      }
    }

    // Now delete the projects
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('created_date', '2025-01-01')

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message })
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${projectsToDelete?.length || 0} projects from January 1, 2025`,
      deletedProjects: projectsToDelete?.length || 0,
      deletedRatings: ratingsToDelete,
      deletedProjectIds: projectsToDelete?.map(p => p.project_id) || []
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}