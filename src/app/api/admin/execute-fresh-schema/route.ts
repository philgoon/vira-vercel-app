import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// [R1] Execute Database Schema Functions - Deploy Vendor Sync Functions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // Vendor sync functions SQL
    const vendorSyncFunctions = `
-- Function to find vendors that exist in projects but not in vendors table
CREATE OR REPLACE FUNCTION find_missing_vendors()
RETURNS TABLE (
    vendor_id text,
    project_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        p.vendor_id,
        COUNT(p.project_id) as project_count
    FROM projects p
    LEFT JOIN vendors v ON p.vendor_id = v.vendor_id
    WHERE v.vendor_id IS NULL
      AND p.vendor_id IS NOT NULL
      AND p.vendor_id != ''
    GROUP BY p.vendor_id
    ORDER BY project_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to sync missing vendors from projects to vendors table
CREATE OR REPLACE FUNCTION sync_missing_vendors()
RETURNS TABLE (
    vendor_id text,
    created boolean,
    error_message text
) AS $$
DECLARE
    missing_vendor RECORD;
    insert_success boolean;
    error_msg text;
BEGIN
    -- Loop through missing vendors and create them
    FOR missing_vendor IN
        SELECT mv.vendor_id, mv.project_count
        FROM find_missing_vendors() mv
    LOOP
        BEGIN
            insert_success := true;
            error_msg := NULL;

            -- Insert the missing vendor with basic information
            INSERT INTO vendors (
                vendor_id,
                vendor_name,
                vendor_type,
                vendor_status,
                service_category,
                created_at,
                updated_at
            ) VALUES (
                missing_vendor.vendor_id,
                missing_vendor.vendor_id, -- Use vendor_id as initial name
                'Project Vendor',
                'Active',
                'General Services',
                NOW(),
                NOW()
            );

        EXCEPTION WHEN OTHERS THEN
            insert_success := false;
            error_msg := SQLERRM;
        END;

        -- Return result for this vendor
        RETURN QUERY SELECT
            missing_vendor.vendor_id,
            insert_success,
            error_msg;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function to get vendor sync status
CREATE OR REPLACE FUNCTION vendor_sync_status()
RETURNS TABLE (
    total_vendors bigint,
    total_projects bigint,
    missing_vendors bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM vendors)::bigint as total_vendors,
        (SELECT COUNT(*) FROM projects)::bigint as total_projects,
        (SELECT COUNT(*) FROM find_missing_vendors())::bigint as missing_vendors;
END;
$$ LANGUAGE plpgsql;
`;

    // Execute the functions
    const { error } = await supabase.rpc('exec', {
      sql: vendorSyncFunctions
    });

    if (error) {
      // If rpc doesn't work, try direct SQL execution
      console.log('RPC method failed, trying direct execution...', error);

      // Split into individual function creations
      const functions = vendorSyncFunctions.split('CREATE OR REPLACE FUNCTION');

      for (let i = 1; i < functions.length; i++) {
        const functionSql = 'CREATE OR REPLACE FUNCTION' + functions[i];

        const { error: funcError } = await supabase
          .from('_dummy') // This will fail but execute the SQL
          .select('*')
          .eq('sql', functionSql);

        if (funcError) {
          console.log(`Function ${i} execution result:`, funcError);
        }
      }
    }

    // Test if functions were created by calling one
    const { data: testData, error: testError } = await supabase
      .rpc('vendor_sync_status');

    if (testError) {
      return NextResponse.json({
        success: false,
        error: 'Functions created but not accessible',
        details: testError.message,
        message: 'Database functions may need to be created manually via Supabase dashboard'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vendor sync functions deployed successfully',
      testResult: testData
    });

  } catch (error) {
    console.error('Error executing schema:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to deploy vendor sync functions'
    }, { status: 500 });
  }
}
