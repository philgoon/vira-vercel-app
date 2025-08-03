import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// [R1] Clear all imported data for clean reimport
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Clearing all imported data...');

    // Clear tables in correct order (due to foreign key constraints)
    // 1. Clear vendor_ratings first (has FK to vendors_enhanced)
    const { error: ratingsError } = await supabase
      .from('vendor_ratings')
      .delete()
      .neq('id', 0); // Delete all rows (neq 0 matches all positive IDs)

    // 2. Clear projects_consolidated (has FK to vendors_enhanced)
    const { error: projectsError } = await supabase
      .from('projects_consolidated')
      .delete()
      .neq('project_id', 0); // Delete all rows (neq 0 matches all positive IDs)

    // 3. Clear clients (no FK dependencies)
    const { error: clientsError } = await supabase
      .from('clients')
      .delete()
      .neq('client_id', 0); // Delete all rows (neq 0 matches all positive IDs)

    // 4. Clear vendors_enhanced last (referenced by other tables)
    const { error: vendorsError } = await supabase
      .from('vendors_enhanced')
      .delete()
      .neq('vendor_id', 0); // Delete all rows (neq 0 matches all positive IDs)

    if (projectsError) {
      console.error('Projects clear error:', projectsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to clear projects',
        details: projectsError.message
      }, { status: 500 });
    }

    if (vendorsError) {
      console.error('Vendors clear error:', vendorsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to clear vendors',
        details: vendorsError.message
      }, { status: 500 });
    }

    if (clientsError) {
      console.error('Clients clear error:', clientsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to clear clients',
        details: clientsError.message
      }, { status: 500 });
    }

    if (ratingsError) {
      console.error('Ratings clear error:', ratingsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to clear ratings',
        details: ratingsError.message
      }, { status: 500 });
    }

    console.log('✅ All data cleared successfully');

    return NextResponse.json({
      success: true,
      message: 'All imported data cleared successfully',
      clearedTables: ['projects_consolidated', 'vendors_enhanced', 'clients', 'vendor_ratings']
    });

  } catch (error) {
    console.error('Clear data error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during data clearing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
