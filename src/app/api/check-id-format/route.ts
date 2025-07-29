import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data: sampleVendor } = await supabase
    .from('vendors')
    .select('vendor_id, vendor_name')
    .limit(1)
    .single()
  
  const { data: sampleClient } = await supabase
    .from('clients')
    .select('client_id, client_name')
    .limit(1)
    .single()
  
  const { data: sampleProject } = await supabase
    .from('projects')
    .select('project_id, project_title, client_id')
    .limit(1)
    .single()
  
  return NextResponse.json({
    sampleVendor,
    sampleClient, 
    sampleProject
  })
}