import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  // Try to get one record from each table to see the structure
  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .limit(1)
    .single()
  
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .limit(1)
    .single()
  
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .limit(1)
    .single()
  
  return NextResponse.json({
    vendorColumns: vendor ? Object.keys(vendor) : 'No vendors found',
    clientColumns: client ? Object.keys(client) : 'No clients found',
    projectColumns: project ? Object.keys(project) : 'No projects found'
  })
}