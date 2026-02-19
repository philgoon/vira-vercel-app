import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, isNextResponse } from '@/lib/clerk-auth';

// [R4] Vendor sync API - populates missing vendor records to enable calculated metrics
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  try {
    // [R4] Find vendor_ids in projects that don't exist in vendors table
    const { data: projectVendors, error: projectError } = await supabase
      .from('projects_consolidated')
      .select('vendor_id')
      .not('vendor_id', 'is', null)
      .neq('vendor_id', '');

    if (projectError) {
      console.error('Error querying projects:', projectError);
      return NextResponse.json({
        success: false,
        error: 'Failed to query projects table',
        details: projectError.message
      }, { status: 500 });
    }

    // [R4] Get existing vendors from vendors table
    const { data: existingVendors, error: vendorError } = await supabase
      .from('vendors_enhanced')
      .select('vendor_id');

    if (vendorError) {
      console.error('Error querying vendors:', vendorError);
      return NextResponse.json({
        success: false,
        error: 'Failed to query vendors table',
        details: vendorError.message
      }, { status: 500 });
    }

    // [R4] Create sets for efficient lookup and find missing vendors
    const existingVendorIds = new Set(existingVendors?.map(v => v.vendor_id) || []);
    const projectVendorIds = projectVendors?.map(p => p.vendor_id) || [];

    // Count projects per vendor and find missing ones
    const vendorProjectCounts: Record<string, number> = {};
    projectVendorIds.forEach(vendorId => {
      if (vendorId) {
        vendorProjectCounts[vendorId] = (vendorProjectCounts[vendorId] || 0) + 1;
      }
    });

    // Find vendors that exist in projects but not in vendors table
    const missingVendors = Object.entries(vendorProjectCounts)
      .filter(([vendorId]) => !existingVendorIds.has(vendorId))
      .map(([vendorId, projectCount]) => ({
        vendor_id: vendorId,
        projectCount
      }))
      .sort((a, b) => b.projectCount - a.projectCount); // Sort by project count descending

    return NextResponse.json({
      success: true,
      missingVendors,
      count: missingVendors.length,
      message: `Found ${missingVendors.length} vendors that need to be synced`,
      summary: {
        totalVendors: existingVendors?.length || 0,
        totalProjects: projectVendorIds.length,
        uniqueProjectVendors: Object.keys(vendorProjectCounts).length
      }
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

export async function POST(request: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  try {
    const body = await request.json();
    const { action } = body;

    if (action !== 'sync') {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Use "sync" to create missing vendor records.'
      }, { status: 400 });
    }

    // [R4] Get missing vendors using same logic as GET
    const { data: projectVendors, error: projectError } = await supabase
      .from('projects_consolidated')
      .select('vendor_id')
      .not('vendor_id', 'is', null)
      .neq('vendor_id', '');

    if (projectError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to query projects table',
        details: projectError.message
      }, { status: 500 });
    }

    const { data: existingVendors, error: vendorError } = await supabase
      .from('vendors_enhanced')
      .select('vendor_id');

    if (vendorError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to query vendors table',
        details: vendorError.message
      }, { status: 500 });
    }

    // [R4] Find missing vendors
    const existingVendorIds = new Set(existingVendors?.map(v => v.vendor_id) || []);
    const projectVendorIds = projectVendors?.map(p => p.vendor_id) || [];
    const uniqueMissingVendors = [...new Set(projectVendorIds.filter(vendorId =>
      vendorId && !existingVendorIds.has(vendorId)
    ))];

    if (uniqueMissingVendors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No missing vendors to sync',
        results: {
          created: 0,
          errors: []
        }
      });
    }

    // [R4] Create missing vendor records with proper defaults
    const vendorsToInsert = uniqueMissingVendors.map(vendorId => ({
      vendor_id: vendorId,
      vendor_name: vendorId, // Use vendor_id as initial name
      vendor_type: 'Project Vendor',
      vendor_status: 'Active',
      service_category: 'General Services',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data: insertResult, error: insertError } = await supabase
      .from('vendors_enhanced')
      .insert(vendorsToInsert)
      .select('vendor_id');

    if (insertError) {
      console.error('Error inserting vendors:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create vendor records',
        details: insertError.message
      }, { status: 500 });
    }

    // [R4] Get updated counts for confirmation
    const { data: updatedVendorCount } = await supabase
      .from('vendors_enhanced')
      .select('vendor_id', { count: 'exact', head: true });

    const created = insertResult?.length || 0;

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${created} vendor(s)`,
      results: {
        created,
        errors: [],
        vendorsCreated: insertResult?.map(v => v.vendor_id) || []
      },
      summary: {
        totalVendors: updatedVendorCount || 0,
        totalProjects: projectVendorIds.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sync API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during sync',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
