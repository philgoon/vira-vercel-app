import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Get top performing vendors
    const { data: topVendors, error: vendorsError } = await supabaseAdmin
      .from('vendor_performance')
      .select('vendor_id, vendor_name, avg_overall_rating, total_projects, rated_projects')
      .not('avg_overall_rating', 'is', null)
      .order('avg_overall_rating', { ascending: false })
      .limit(5);

    if (vendorsError) throw vendorsError;

    // Get review completion stats
    const { data: assignments, error: assignmentsError } = await supabaseAdmin
      .from('review_assignments')
      .select('status');

    if (assignmentsError) throw assignmentsError;

    const totalAssignments = assignments?.length || 0;
    const completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0;
    const pendingAssignments = totalAssignments - completedAssignments;
    const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

    // Get recent activity (last 5 rated projects)
    const { data: recentProjects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select('project_id, project_title, vendor_name, project_overall_rating_calc, updated_at')
      .not('project_overall_rating_calc', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (projectsError) throw projectsError;

    return NextResponse.json({
      topVendors: topVendors || [],
      reviewStats: {
        total: totalAssignments,
        completed: completedAssignments,
        pending: pendingAssignments,
        completionRate: Math.round(completionRate),
      },
      recentActivity: recentProjects || [],
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
