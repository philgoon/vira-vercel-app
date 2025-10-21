import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
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
