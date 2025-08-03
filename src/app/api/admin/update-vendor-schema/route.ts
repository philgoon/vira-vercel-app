// [R3]: Update vendor schema to match CSV structure
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Adding missing columns to vendors_enhanced table...');

    // Since we can't execute DDL directly, we'll return the SQL for manual execution
    const alterStatements = [
      "ALTER TABLE vendors_enhanced ADD COLUMN IF NOT EXISTS vendor_type TEXT;",
      "ALTER TABLE vendors_enhanced ADD COLUMN IF NOT EXISTS vendor_status TEXT DEFAULT 'active';",
      "ALTER TABLE vendors_enhanced ADD COLUMN IF NOT EXISTS time_zone TEXT;",
      "ALTER TABLE vendors_enhanced ADD COLUMN IF NOT EXISTS contact_preference TEXT;",
      "ALTER TABLE vendors_enhanced ADD COLUMN IF NOT EXISTS onboarding_date TEXT;",
      "ALTER TABLE vendors_enhanced ADD COLUMN IF NOT EXISTS overall_rating DECIMAL(3,1);",
      "ALTER TABLE vendors_enhanced ADD COLUMN IF NOT EXISTS industry TEXT;",
      "ALTER TABLE vendors_enhanced ADD COLUMN IF NOT EXISTS service_category TEXT;",
      "ALTER TABLE vendors_enhanced ADD COLUMN IF NOT EXISTS skills TEXT;",
      "ALTER TABLE vendors_enhanced ADD COLUMN IF NOT EXISTS portfolio_url TEXT;",
      "ALTER TABLE vendors_enhanced ADD COLUMN IF NOT EXISTS sample_work_urls TEXT;",
      "ALTER TABLE vendors_enhanced ADD COLUMN IF NOT EXISTS pricing_structure TEXT;",
      "ALTER TABLE vendors_enhanced ADD COLUMN IF NOT EXISTS rate_cost TEXT;",
      "ALTER TABLE vendors_enhanced ADD COLUMN IF NOT EXISTS availability TEXT;"
    ];

    return NextResponse.json({
      success: true,
      message: 'Schema update SQL generated',
      instructions: 'Execute these SQL statements in Supabase SQL Editor:',
      sql: alterStatements.join('\n'),
      note: 'After executing the SQL, run the vendor import again'
    });

  } catch (error) {
    console.error('Schema update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}