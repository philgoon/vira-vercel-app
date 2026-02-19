import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, isNextResponse } from '@/lib/clerk-auth';

export async function GET() {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  try {
    // Get all review assignments with related data
    const { data: assignments, error: assignmentsError } = await supabaseAdmin
      .from('review_assignments')
      .select(`
        assignment_id,
        project_id,
        reviewer_id,
        assigned_at,
        due_date,
        completed_at,
        status,
        projects(project_title),
        reviewer:user_profiles!reviewer_id(full_name, email)
      `);

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
      console.error('Error details:', JSON.stringify(assignmentsError, null, 2));
      return NextResponse.json({
        error: assignmentsError.message,
        details: assignmentsError
      }, { status: 500 });
    }

    // DEBUG: Log the raw assignments data to see what we're getting
    console.log('=== RAW ASSIGNMENTS DATA ===');
    console.log('Total assignments:', assignments?.length);
    if (assignments && assignments.length > 0) {
      console.log('First assignment structure:', JSON.stringify(assignments[0], null, 2));
    }

    if (!assignments || assignments.length === 0) {
      // Return empty stats if no assignments
      return NextResponse.json({
        stats: {
          total_assignments: 0,
          pending_count: 0,
          in_progress_count: 0,
          completed_count: 0,
          overdue_count: 0,
          completion_rate: 0,
          average_completion_days: 0,
        },
        overdue_assignments: [],
      });
    }

    const now = new Date();

    // Calculate stats
    const total = assignments.length;
    const pending = assignments.filter(a => a.status === 'pending').length;
    const inProgress = assignments.filter(a => a.status === 'in_progress').length;
    const completed = assignments.filter(a => a.status === 'completed').length;

    // Calculate overdue (pending/in_progress past due date)
    const overdue = assignments.filter(a => {
      if (a.status === 'completed') return false;
      if (!a.due_date) return false;
      return new Date(a.due_date) < now;
    });

    const overdueCount = overdue.length;

    // Calculate completion rate
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Calculate average completion time (in days)
    const completedAssignments = assignments.filter(
      a => a.status === 'completed' && a.assigned_at && a.completed_at
    );

    let avgCompletionDays = 0;
    if (completedAssignments.length > 0) {
      const totalDays = completedAssignments.reduce((sum, a) => {
        const assigned = new Date(a.assigned_at!);
        const completed = new Date(a.completed_at!);
        const days = (completed.getTime() - assigned.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      avgCompletionDays = totalDays / completedAssignments.length;
    }

    // Format overdue assignments for display
    const overdueAssignments = overdue.map(a => {
      const dueDate = new Date(a.due_date!);
      const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      // Handle both object and array returns from Supabase joins
      // For one-to-one/many-to-one relationships, Supabase returns objects
      // For one-to-many relationships, it returns arrays
      const project = Array.isArray(a.projects) ? a.projects[0] : a.projects;
      const reviewer = Array.isArray(a.reviewer) ? a.reviewer[0] : a.reviewer;

      return {
        assignment_id: a.assignment_id,
        project_title: project?.project_title || 'Unknown Project',
        reviewer_name: reviewer?.full_name || reviewer?.email || 'Unknown Reviewer',
        reviewer_email: reviewer?.email || '',
        due_date: a.due_date,
        days_overdue: daysOverdue,
      };
    }).sort((a, b) => b.days_overdue - a.days_overdue); // Sort by most overdue first

    return NextResponse.json({
      stats: {
        total_assignments: total,
        pending_count: pending,
        in_progress_count: inProgress,
        completed_count: completed,
        overdue_count: overdueCount,
        completion_rate: completionRate,
        average_completion_days: avgCompletionDays,
      },
      overdue_assignments: overdueAssignments,
    });
  } catch (error) {
    console.error('Error calculating review stats:', error);
    return NextResponse.json(
      { error: 'Failed to calculate review statistics' },
      { status: 500 }
    );
  }
}
