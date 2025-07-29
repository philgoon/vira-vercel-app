import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    // Get all projects grouped by title
    const { data: projects, error } = await supabase
      .from('projects')
      .select('project_id, project_title, client_id, status')
      .order('project_id')

    if (error) {
      return NextResponse.json({ error: error.message })
    }

    // Group by normalized title
    const titleMap = new Map<string, any[]>()
    
    projects?.forEach(project => {
      const normalizedTitle = project.project_title.trim().toLowerCase()
      if (!titleMap.has(normalizedTitle)) {
        titleMap.set(normalizedTitle, [])
      }
      titleMap.get(normalizedTitle)?.push(project)
    })

    // For each duplicate group, keep the first (lower ID) and delete the rest
    const projectsToDelete: string[] = []
    const deletionDetails: any[] = []

    titleMap.forEach((duplicates, title) => {
      if (duplicates.length > 1) {
        // Sort by project_id to keep the lowest one
        duplicates.sort((a, b) => a.project_id.localeCompare(b.project_id))
        
        const keepProject = duplicates[0]
        const deleteProjects = duplicates.slice(1)
        
        deleteProjects.forEach(project => {
          projectsToDelete.push(project.project_id)
          deletionDetails.push({
            title: project.project_title,
            deletingId: project.project_id,
            keepingId: keepProject.project_id
          })
        })
      }
    })

    if (projectsToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No duplicates found',
        deletedCount: 0
      })
    }

    // Delete the duplicate projects
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .in('project_id', projectsToDelete)

    if (deleteError) {
      return NextResponse.json({ 
        error: `Failed to delete duplicates: ${deleteError.message}` 
      })
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${projectsToDelete.length} duplicate projects`,
      deletedCount: projectsToDelete.length,
      remainingProjects: projects!.length - projectsToDelete.length,
      deletionDetails: deletionDetails.slice(0, 10) // Show first 10 for confirmation
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}