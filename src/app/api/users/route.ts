// [R-ADMIN] API Route: Fetch Users with Admin Access
import { NextResponse } from 'next/server'
// [RLS-FIX] Use shared supabaseAdmin from lib, matching /api/projects pattern
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Fetch all users using admin client to bypass RLS
    const { data: users, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
