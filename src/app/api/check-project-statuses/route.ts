import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get all unique project statuses with counts
    const { data, error } = await supabase
      .from('projects')
      .select('status')
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      })
    }

    // Count occurrences of each status
    const statusCounts = data?.reduce((acc: any, project) => {
      const status = project.status || 'null'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    // Get recent projects for sampling
    const { data: recentProjects } = await supabase
      .from('projects')
      .select('project_id, project_title, status')
      .order('created_date', { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      statusCounts,
      totalProjects: data?.length || 0,
      recentProjects: recentProjects || []
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}