import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Create service role client for bypassing RLS
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Development bypass: Allow if no auth system is set up yet
    const isDevelopment = process.env.NODE_ENV === 'development'
    const skipAuth = isDevelopment && process.env.SKIP_AUTH === 'true'
    
    if (!skipAuth) {
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const { invite_id } = await request.json()

    if (!invite_id) {
      return NextResponse.json({ error: 'Invite ID required' }, { status: 400 })
    }

    // Fetch the invite using admin client
    const { data: invite, error: fetchError } = await supabaseAdmin
      .from('vendor_invites')
      .select('*')
      .eq('invite_id', invite_id)
      .single()

    if (fetchError || !invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    // Check if invite can be cancelled
    if (invite.status === 'accepted') {
      return NextResponse.json({ error: 'Cannot cancel an accepted invite' }, { status: 400 })
    }

    if (invite.status === 'cancelled') {
      return NextResponse.json({ error: 'Invite already cancelled' }, { status: 400 })
    }

    // Update invite status to cancelled using admin client
    const { error: updateError } = await supabaseAdmin
      .from('vendor_invites')
      .update({ status: 'cancelled' })
      .eq('invite_id', invite_id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ 
      success: true,
      message: 'Invite cancelled successfully'
    })

  } catch (error) {
    console.error('Error cancelling invite:', error)
    return NextResponse.json({ error: 'Failed to cancel invite' }, { status: 500 })
  }
}
