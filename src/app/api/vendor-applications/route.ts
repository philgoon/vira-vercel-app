// [C1] API Route: Fetch Vendor Applications
import { NextResponse } from 'next/server'
// [RLS-FIX] Use service role client to bypass RLS, similar to /api/projects pattern
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Create service role client for bypassing RLS
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch all applications using admin client to bypass RLS
    const { data: applications, error } = await supabaseAdmin
      .from('vendor_applications')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ applications })

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
