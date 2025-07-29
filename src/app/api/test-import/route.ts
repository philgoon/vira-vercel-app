import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Test creating a client
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({ 
        name: 'Test Client ' + Date.now(),
        status: 'active' 
      })
      .select()
      .single()
    
    if (clientError) {
      return NextResponse.json({ 
        stage: 'client creation',
        error: clientError.message,
        details: clientError
      })
    }
    
    // Test creating a project
    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert({
        client_name: newClient.name,
        client_id: newClient.id,
        project_name: 'Test Project ' + Date.now(),
        status: 'active'
      })
      .select()
      .single()
    
    if (projectError) {
      return NextResponse.json({ 
        stage: 'project creation',
        error: projectError.message,
        details: projectError,
        client: newClient
      })
    }
    
    return NextResponse.json({
      success: true,
      client: newClient,
      project: newProject
    })
    
  } catch (error: any) {
    return NextResponse.json({
      stage: 'general error',
      error: error.message
    })
  }
}