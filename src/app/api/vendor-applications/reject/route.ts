// [C1] API Route: Reject Vendor Application
// [R-CLERK-7]: Auth via Clerk
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth, isNextResponse } from '@/lib/clerk-auth'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth('admin')
    if (isNextResponse(authResult)) return authResult

    const body = await request.json()
    const { application_id, rejection_reason } = body

    if (!application_id) {
      return NextResponse.json({ error: 'Application ID required' }, { status: 400 })
    }

    // Fetch the application
    const { data: application, error: appError } = await supabaseAdmin
      .from('vendor_applications')
      .select('*')
      .eq('application_id', application_id)
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.status !== 'pending') {
      return NextResponse.json({ error: 'Application already processed' }, { status: 400 })
    }

    // Update application status to rejected
    const { error: updateError } = await supabaseAdmin
      .from('vendor_applications')
      .update({
        status: 'rejected',
        reviewed_by: authResult.userId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejection_reason || 'Application rejected by admin'
      })
      .eq('application_id', application_id)

    if (updateError) {
      console.error('Error updating application:', updateError)
      return NextResponse.json({ 
        error: 'Failed to reject application', 
        details: updateError.message 
      }, { status: 500 })
    }

    // TODO: Send rejection email to applicant

    return NextResponse.json({
      success: true,
      message: 'Application rejected successfully'
    })

  } catch (error: any) {
    console.error('Error rejecting application:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error?.message || String(error)
    }, { status: 500 })
  }
}
