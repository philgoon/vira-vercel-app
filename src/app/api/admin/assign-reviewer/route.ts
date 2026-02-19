import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isNextResponse } from '@/lib/clerk-auth'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  try {
    const { project_id, reviewer_id, assigned_by } = await req.json()

    if (!project_id || !reviewer_id) {
      return NextResponse.json(
        { error: 'Missing project_id or reviewer_id' },
        { status: 400 }
      )
    }

    // Check if assignment already exists
    const { data: existing } = await supabaseAdmin
      .from('review_assignments')
      .select('assignment_id')
      .eq('project_id', project_id)
      .eq('reviewer_id', reviewer_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { message: 'Reviewer already assigned to this project' },
        { status: 200 }
      )
    }

    // Create the assignment
    const { data: assignment, error } = await supabaseAdmin
      .from('review_assignments')
      .insert({
        project_id,
        reviewer_id,
        assigned_by: assigned_by || null,
        status: 'pending',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating assignment:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for reviewer
    const { data: reviewer } = await supabaseAdmin
      .from('user_profiles')
      .select('full_name, email')
      .eq('user_id', reviewer_id)
      .single()

    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('project_title')
      .eq('project_id', project_id)
      .single()

    if (reviewer && project) {
      await supabaseAdmin.from('notifications').insert({
        user_id: reviewer_id,
        notification_type: 'review_assigned',
        title: 'New Review Assignment',
        message: `You have been assigned to review: ${project.project_title}`,
        link_url: `/projects/${project_id}`,
        is_read: false
      })
    }

    return NextResponse.json({
      success: true,
      assignment,
      message: 'Reviewer assigned successfully'
    })
  } catch (error) {
    console.error('Error assigning reviewer:', error)
    return NextResponse.json(
      { error: 'Failed to assign reviewer' },
      { status: 500 }
    )
  }
}

// GET: Fetch reviewers for a project
export async function GET(req: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  try {
    const { searchParams } = new URL(req.url)
    const project_id = searchParams.get('project_id')

    if (!project_id) {
      return NextResponse.json({ error: 'Missing project_id' }, { status: 400 })
    }

    const { data: assignments, error } = await supabaseAdmin
      .from('review_assignments')
      .select(`
        assignment_id,
        reviewer_id,
        assigned_at,
        status,
        due_date,
        completed_at,
        user_profiles!review_assignments_reviewer_id_fkey(
          user_id,
          email,
          full_name
        )
      `)
      .eq('project_id', project_id)

    if (error) {
      console.error('Error fetching assignments:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ assignments: assignments || [] })
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}

// DELETE: Remove reviewer assignment
export async function DELETE(req: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  try {
    const { searchParams } = new URL(req.url)
    const assignment_id = searchParams.get('assignment_id')

    if (!assignment_id) {
      return NextResponse.json({ error: 'Missing assignment_id' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('review_assignments')
      .delete()
      .eq('assignment_id', assignment_id)

    if (error) {
      console.error('Error deleting assignment:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Reviewer assignment removed'
    })
  } catch (error) {
    console.error('Error removing assignment:', error)
    return NextResponse.json(
      { error: 'Failed to remove assignment' },
      { status: 500 }
    )
  }
}
