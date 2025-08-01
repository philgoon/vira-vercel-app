// [R1] Admin API endpoint to update vendor categories
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Updating vendor categories for data_analytics specialists...');

    // List of vendors that should be categorized as data_analytics
    const dataAnalyticsVendors = ['Kelvin', 'Praveen', 'Matt'];
    const results = [];

    // Update each vendor's service_categories to include data_analytics
    for (const vendorName of dataAnalyticsVendors) {
      console.log(`Updating ${vendorName}...`);

      const { data, error } = await supabase
        .from('vendors')
        .update({
          service_categories: ['data_analytics']
        })
        .eq('vendor_name', vendorName)
        .select();

      if (error) {
        console.error(`❌ Error updating ${vendorName}:`, error);
        results.push({ vendor: vendorName, status: 'error', error: error.message });
      } else if (data && data.length > 0) {
        console.log(`✅ Successfully updated ${vendorName}`);
        results.push({ vendor: vendorName, status: 'success' });
      } else {
        console.log(`⚠️  No vendor found with name: ${vendorName}`);
        results.push({ vendor: vendorName, status: 'not_found' });
      }
    }

    console.log('🎉 Vendor category updates completed!');

    return NextResponse.json({
      success: true,
      message: 'Vendor category updates completed!',
      results,
      note: 'You can now search for data_analytics in ViRA Match'
    });

  } catch (error) {
    console.error('❌ Database update failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Database update failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
