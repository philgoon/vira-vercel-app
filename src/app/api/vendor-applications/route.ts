// [C1] API Route: Fetch Vendor Applications
import { NextResponse } from 'next/server'
// [RLS-FIX] Use shared supabaseAdmin from lib, matching /api/projects pattern
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
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
