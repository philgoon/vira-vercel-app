import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Test vendors table
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('*')
      .limit(1)
    
    // Test clients table
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1)
    
    // Test projects table
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(1)
    
    return NextResponse.json({
      vendors: { exists: !vendorsError, error: vendorsError?.message },
      clients: { exists: !clientsError, error: clientsError?.message },
      projects: { exists: !projectsError, error: projectsError?.message },
      connectionTest: 'Success'
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      connectionTest: 'Failed'
    })
  }
}