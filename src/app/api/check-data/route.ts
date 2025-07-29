import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { count: vendorCount } = await supabase
    .from('vendors')
    .select('*', { count: 'exact', head: true })
  
  const { count: clientCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
  
  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
  
  return NextResponse.json({
    vendors: vendorCount || 0,
    clients: clientCount || 0,
    projects: projectCount || 0
  })
}