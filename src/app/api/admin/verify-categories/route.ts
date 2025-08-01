// [R1] Admin API endpoint to verify vendor categories
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Verifying vendor categories for Kelvin, Praveen, Matt...');

    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('vendor_name, service_categories')
      .in('vendor_name', ['Kelvin', 'Praveen', 'Matt']);

    if (error) {
      console.error('❌ Error fetching vendors:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log('📊 Current vendor categories:', vendors);

    // Also check all vendors with data_analytics category
    const { data: dataAnalyticsVendors, error: daError } = await supabase
      .from('vendors')
      .select('vendor_name, service_categories')
      .contains('service_categories', ['data_analytics']);

    if (daError) {
      console.error('❌ Error fetching data_analytics vendors:', daError);
    } else {
      console.log('📈 All data_analytics vendors:', dataAnalyticsVendors);
    }

    return NextResponse.json({
      success: true,
      targetVendors: vendors,
      allDataAnalyticsVendors: dataAnalyticsVendors || [],
      message: 'Category verification completed'
    });

  } catch (error) {
    console.error('❌ Verification failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
