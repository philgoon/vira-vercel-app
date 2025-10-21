// [R-ADMIN] API Route: Fetch Users with Admin Access
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
