import { NextResponse } from 'next/server'
// [RLS-FIX] Use shared supabaseAdmin from lib, matching /api/projects pattern
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Fetch all invites using admin client to bypass RLS
    const { data: invites, error } = await supabaseAdmin
      .from('vendor_invites')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ invites })

  } catch (error) {
    console.error('Error fetching invites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
