// [R8.2] Simplified vendor ratings API route using new 2-table schema
// Replaces 96 lines of client-side aggregation with single query
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Single query replaces complex client-side aggregation
    // All metrics are auto-calculated by database triggers
    const { data: vendor, error } = await supabase
      .from('vendors_enhanced')
      .select(`
        vendor_id,
        vendor_name,
        service_categories,
        specialties,
        status,
        total_projects,
        completed_projects,
        avg_success_rating,
        avg_quality_rating,
        avg_communication_rating,
        avg_overall_rating,
        recommendation_rate,
        on_time_rate,
        on_budget_rate,
        last_project_date,
        performance_tier
      `)
      .eq('vendor_id', id)
      .single();

    if (error) {
      console.error('Error fetching vendor:', error);
      return NextResponse.json({ error: 'Failed to fetch vendor data' }, { status: 500 });
    }

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Optional: Get recent project details if needed
    const { data: recentProjects } = await supabase
      .from('projects_consolidated')
      .select(`
        project_name,
        client_name,
        success_rating,
        quality_rating,
        communication_rating,
        overall_rating,
        end_date
      `)
      .eq('vendor_name', vendor.vendor_name)
      .not('overall_rating', 'is', null)
      .order('end_date', { ascending: false })
      .limit(5);

    return NextResponse.json({
      vendor,
      recentProjects: recentProjects || []
    });

  } catch (error) {
    console.error('Error in vendor ratings API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
