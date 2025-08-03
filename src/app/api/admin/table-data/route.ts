import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// [R1] Admin API for fetching table data with full database visibility
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');

    if (!table) {
      return NextResponse.json({ error: 'Table parameter required' }, { status: 400 });
    }

    let query;

    switch (table) {
      case 'vendors':
        query = supabase
          .from('vendors_enhanced')
          .select('*');
        break;

      case 'clients':
        query = supabase
          .from('clients')
          .select('*');
        break;

      case 'projects':
        query = supabase
          .from('projects_consolidated')
          .select('*');
        break;

      case 'ratings':
        // NOTE: The 'ratings' table is now part of 'projects_consolidated'.
        // We will fetch this data when the 'projects' table is requested.
        // This case can be removed or adjusted later if a separate ratings view is needed.
        query = supabase
          .from('projects_consolidated')
          .select('*')
          .not('project_success', 'is', null); // Only fetch projects that have ratings
        break;

      default:
        return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    // Transform data for easier frontend consumption
    const transformedData = data;

    // No transformation needed for simple queries

    return NextResponse.json({
      success: true,
      data: transformedData || [],
      count: transformedData?.length || 0
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
