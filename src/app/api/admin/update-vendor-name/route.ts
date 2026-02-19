// [R3]: Update vendor name to match project vendor name
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, isNextResponse } from '@/lib/clerk-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  try {
    const { vendorId, newVendorName } = await request.json();

    if (!vendorId || !newVendorName) {
      return NextResponse.json({
        success: false,
        error: 'Missing vendorId or newVendorName'
      }, { status: 400 });
    }

    console.log(`🔄 Updating vendor ${vendorId} name to "${newVendorName}"`);

    // Update the vendor name in vendors_enhanced table
    const { data, error } = await supabase
      .from('vendors_enhanced')
      .update({ vendor_name: newVendorName })
      .eq('vendor_id', vendorId)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update vendor name',
        details: error.message
      }, { status: 500 });
    }

    console.log(`✅ Successfully updated vendor name to "${newVendorName}"`);

    // The trigger will automatically update project metrics for this vendor
    // No need to manually update aggregations

    return NextResponse.json({
      success: true,
      message: `Vendor name updated to "${newVendorName}"`,
      vendor: data
    });

  } catch (error) {
    console.error('Vendor name update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}