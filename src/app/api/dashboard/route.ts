import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, isNextResponse } from '@/lib/clerk-auth';

export async function GET() {
  const authResult = await requireAuth(['admin', 'team']);
  if (isNextResponse(authResult)) return authResult;

  try {
    // Get counts for dashboard stats
    const [vendorCount, projectCount, clientCount, ratingCount] = await Promise.all([
      supabaseAdmin.from('vendors').select('vendor_id', { count: 'exact', head: true }),
      supabaseAdmin.from('projects').select('project_id', { count: 'exact', head: true }),
      supabaseAdmin.from('clients_summary').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('projects_with_vendor').select('*', { count: 'exact', head: true }).eq('rating_status', 'Complete'),
    ]);

    // Get top performing vendors
    const { data: topVendors, error: vendorsError } = await supabaseAdmin
      .from('vendor_performance')
      .select('vendor_id, vendor_name, avg_overall_rating, total_projects, rated_projects, recommendation_pct')
      .not('avg_overall_rating', 'is', null)
      .order('avg_overall_rating', { ascending: false })
      .limit(8);

    if (vendorsError) throw vendorsError;

    // Get category + availability for those vendors
    const vendorIds = topVendors?.map(v => v.vendor_id) || [];
    const { data: vendorDetails } = vendorIds.length
      ? await supabaseAdmin
          .from('vendors')
          .select('vendor_id, service_categories, availability_status')
          .in('vendor_id', vendorIds)
      : { data: [] };

    // Get review completion stats from projects_with_vendor (source of truth for rating status)
    const [pendingResult, completedResult] = await Promise.all([
      supabaseAdmin
        .from('projects_with_vendor')
        .select('project_id', { count: 'exact', head: true })
        .or('rating_status.eq.Needs Review,rating_status.eq.Incomplete'),
      supabaseAdmin
        .from('projects_with_vendor')
        .select('project_id', { count: 'exact', head: true })
        .eq('rating_status', 'Complete'),
    ]);

    const pendingAssignments = pendingResult.count || 0;
    const completedAssignments = completedResult.count || 0;
    const totalAssignments = pendingAssignments + completedAssignments;
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
      stats: {
        vendors: vendorCount.count || 0,
        projects: projectCount.count || 0,
        clients: clientCount.count || 0,
        ratings: ratingCount.count || 0,
      },
      topVendors: (topVendors || []).map(v => ({
        ...v,
        ...((vendorDetails || []).find(d => d.vendor_id === v.vendor_id) || {}),
      })),
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
