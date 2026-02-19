// [R4.1] Updated vendors API route using vendor_performance view for new schema
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isNextResponse } from '@/lib/clerk-auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isNextResponse(authResult)) return authResult;
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const id = searchParams.get('id');

    // Step 1: Query the vendor_performance view for aggregated data
    let performanceQuery = supabaseAdmin.from('vendor_performance').select('*');
    if (id) {
      performanceQuery = performanceQuery.eq('vendor_id', id);
    }
    if (status && status !== 'all') {
      performanceQuery = performanceQuery.eq('status', status);
    }
    if (search) {
      performanceQuery = performanceQuery.or(`vendor_name.ilike.%${search}%,vendor_type.ilike.%${search}%`);
    }

    const { data: performanceData, error: performanceError } = await performanceQuery;

    if (performanceError) {
      console.error('Supabase error fetching from vendor_performance:', performanceError);
      return NextResponse.json({ error: 'Failed to fetch vendor performance data' }, { status: 500 });
    }

    if (!performanceData || performanceData.length === 0) {
      return NextResponse.json({ vendors: [] });
    }

    // Step 2: Get vendor IDs to fetch detailed data
    const vendorIds = performanceData.map(p => p.vendor_id);

    // Step 3: Query the vendors table for detailed information
    const { data: detailData, error: detailError } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .in('vendor_id', vendorIds);

    if (detailError) {
      console.error('Supabase error fetching from vendors:', detailError);
      return NextResponse.json({ error: 'Failed to fetch vendor details' }, { status: 500 });
    }

    // Step 4: Merge the two datasets
    const vendors = performanceData.map(performanceItem => {
      const details = detailData.find(d => d.vendor_id === performanceItem.vendor_id) || {};
      return {
        ...details, // Detailed info from 'vendors' table
        ...performanceItem, // Aggregated info from 'vendor_performance'
      };
    });

    // Sort final merged data
    vendors.sort((a, b) => {
      const ratingA = a.avg_overall_rating ?? -1;
      const ratingB = b.avg_overall_rating ?? -1;
      if (ratingA !== ratingB) {
        return ratingB - ratingA;
      }
      return a.vendor_name.localeCompare(b.vendor_name);
    });

    return NextResponse.json({ vendors });

  } catch (error) {
    console.error('Error in vendors API route:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;
  try {
    const body = await request.json();

    const { data: vendor, error } = await supabaseAdmin
      .from('vendors')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
    }

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error) {
    console.error('Failed to create vendor:', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}

// [R5.3] PUT endpoint for updating vendors
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;
  try {
    const body = await request.json();
    const { vendor_id, ...updateData } = body;

    if (!vendor_id) {
      return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
    }

    const { data: vendor, error } = await supabaseAdmin
      .from('vendors')
      .update(updateData)
      .eq('vendor_id', vendor_id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
    }

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({ vendor });
  } catch (error) {
    console.error('Failed to update vendor:', error);
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}
