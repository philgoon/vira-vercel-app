import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    // Get all "Closed" projects (capital C)
    const { data: closedProjects, error: fetchError } = await supabase
      .from('projects')
      .select('project_id, project_title')
      .eq('status', 'Closed')

    if (fetchError) {
      return NextResponse.json({
        success: false,
        error: fetchError.message
      })
    }

    if (!closedProjects || closedProjects.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No closed projects found to update',
        updatedToCompleted: 0,
        updatedToArchived: 0
      })
    }

    let completedCount = 0
    let archivedCount = 0

    // Check each project for existing ratings
    for (const project of closedProjects) {
      // Check if project has any ratings
      const { data: ratings, error: ratingsError } = await supabase
        .from('ratings')
        .select('rating_id')
        .eq('project_id', project.project_id)
        .limit(1)

      if (ratingsError) {
        console.error(`Error checking ratings for project ${project.project_id}:`, ratingsError)
        continue
      }

      // Set status based on whether ratings exist
      const newStatus = ratings && ratings.length > 0 ? 'archived' : 'completed'
      
      const { error: updateError } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('project_id', project.project_id)

      if (updateError) {
        console.error(`Error updating project ${project.project_id}:`, updateError)
        continue
      }

      if (newStatus === 'archived') {
        archivedCount++
      } else {
        completedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${completedCount} projects to "completed" and ${archivedCount} projects to "archived"`,
      updatedToCompleted: completedCount,
      updatedToArchived: archivedCount,
      totalProcessed: closedProjects.length
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}