import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received update data:', body)

    const { project_id } = body

    // First, get the current project to see its structure
    const { data: currentProject, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('project_id', project_id)
      .single()

    console.log('Current project:', currentProject)
    console.log('Fetch error:', fetchError)

    if (fetchError) {
      return NextResponse.json({
        error: 'Project fetch failed',
        details: fetchError,
        receivedData: body
      })
    }

    // Show what columns exist vs what we're trying to update
    const currentColumns = currentProject ? Object.keys(currentProject) : []
    const updateColumns = Object.keys(body).filter(key => key !== 'project_id')

    return NextResponse.json({
      success: false,
      message: 'Debug info',
      currentProject,
      currentColumns,
      updateColumns,
      receivedData: body,
      columnMismatches: updateColumns.filter(col => !currentColumns.includes(col))
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug failed',
      details: error.message,
      stack: error.stack
    })
  }
}