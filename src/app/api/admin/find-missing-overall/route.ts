import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// [R1] Find projects with all 3 ratings but missing overall rating
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Find projects where all 3 individual ratings exist but overall rating is null
    const { data, error } = await supabase
      .from('projects_consolidated')
      .select('project_id, project_title, vendor_name, project_success_rating, quality_rating, communication_rating, project_overall_rating')
      .not('project_success_rating', 'is', null)
      .not('quality_rating', 'is', null)
      .not('communication_rating', 'is', null)
      .is('project_overall_rating', null);

    if (error) {
      console.error('Query error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      projects: data,
      message: `Found ${data.length} projects with all 3 ratings but missing overall rating`
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}