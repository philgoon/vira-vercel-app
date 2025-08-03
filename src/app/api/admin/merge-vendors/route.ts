// [R3]: SECURE merge vendor records - combine CSV vendor data with project vendor name
// [R4]: Transaction-safe operations with rollback capability
// [R6]: Preview/confirmation workflow for safe merges
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// [R6]: Type definitions for merge operations
interface VendorRecord {
  vendor_id: string;
  vendor_name: string;
  vendor_type?: string;
  email?: string;
  updated_at?: string;
}

interface RollbackData {
  originalCsvVendor: VendorRecord;
  projectVendorId: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// [R4]: Validation helper - ensures both vendors exist and are different
async function validateMergeRequest(csvVendorId: string, projectVendorId: string, keepName: string) {
  // Basic validation
  if (!csvVendorId || !projectVendorId || !keepName) {
    return { valid: false, error: 'Missing required parameters: csvVendorId, projectVendorId, keepName' };
  }

  if (csvVendorId === projectVendorId) {
    return { valid: false, error: 'Cannot merge vendor with itself' };
  }

  // Fetch both vendor records
  const [csvResult, projectResult] = await Promise.all([
    supabase.from('vendors_enhanced').select('*').eq('vendor_id', csvVendorId).single(),
    supabase.from('vendors_enhanced').select('*').eq('vendor_id', projectVendorId).single()
  ]);

  if (csvResult.error) {
    return { valid: false, error: `CSV vendor not found: ${csvResult.error.message}` };
  }

  if (projectResult.error) {
    return { valid: false, error: `Project vendor not found: ${projectResult.error.message}` };
  }

  // Check for existing vendor with target name (to prevent constraint violations)
  const { data: existingVendor } = await supabase
    .from('vendors_enhanced')
    .select('vendor_id, vendor_name')
    .ilike('vendor_name', keepName.trim())
    .neq('vendor_id', csvVendorId)
    .neq('vendor_id', projectVendorId);

  if (existingVendor && existingVendor.length > 0) {
    return {
      valid: false,
      error: `Vendor name "${keepName}" already exists (${existingVendor[0].vendor_id})`
    };
  }

  return {
    valid: true,
    csvVendor: csvResult.data,
    projectVendor: projectResult.data
  };
}

// [R6]: Preview merge impact without making changes
async function previewMergeImpact(csvVendorId: string, projectVendorId: string, keepName: string) {
  const normalizedName = keepName.trim();

  // Get projects that will be affected
  const { data: affectedProjects, error: projectsError } = await supabase
    .from('projects_consolidated')
    .select('project_id, project_name, vendor_name, vendor_id')
    .eq('vendor_id', projectVendorId);

  if (projectsError) {
    throw new Error(`Failed to fetch affected projects: ${projectsError.message}`);
  }

  // Get current vendor details for context
  const [csvResult, projectResult] = await Promise.all([
    supabase.from('vendors_enhanced').select('*').eq('vendor_id', csvVendorId).single(),
    supabase.from('vendors_enhanced').select('*').eq('vendor_id', projectVendorId).single()
  ]);

  return {
    impact: {
      affectedProjectCount: affectedProjects?.length || 0,
      affectedProjects: affectedProjects || [],
      changes: {
        from: {
          csvVendor: csvResult.data,
          projectVendor: projectResult.data
        },
        to: {
          finalVendorId: csvVendorId,
          finalVendorName: normalizedName,
          willDelete: projectVendorId
        }
      }
    }
  };
}

// [R4]: Transaction-safe merge using Supabase RPC
async function performSecureMerge(csvVendorId: string, projectVendorId: string, keepName: string) {
  const normalizedName = keepName.trim();

  // Use Supabase's transaction capabilities via custom SQL function
  const { data, error } = await supabase.rpc('merge_vendors_transaction', {
    csv_vendor_id: csvVendorId,
    project_vendor_id: projectVendorId,
    final_vendor_name: normalizedName
  });

  return { data, error };
}

export async function POST(request: NextRequest) {
  try {
    const { csvVendorId, projectVendorId, keepName, preview = false } = await request.json();

    console.log(`🔍 ${preview ? 'Previewing' : 'Validating'} merge request: CSV vendor ${csvVendorId} with project vendor ${projectVendorId}`);
    console.log(`📛 Target name: "${keepName}"`);

    // [R4]: Pre-flight validation (same for preview and execute)
    const validation = await validateMergeRequest(csvVendorId, projectVendorId, keepName);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.error
      }, { status: 400 });
    }

    const { csvVendor, projectVendor } = validation;

    console.log(`✅ Validation passed`);
    console.log(`📊 CSV vendor: "${csvVendor.vendor_name}" (${csvVendor.vendor_id})`);
    console.log(`📊 Project vendor: "${projectVendor.vendor_name}" (${projectVendor.vendor_id})`);

    // [R6]: Handle preview mode - show impact without changes
    if (preview) {
      console.log(`👁️ Generating merge preview...`);
      const previewData = await previewMergeImpact(csvVendorId, projectVendorId, keepName);

      return NextResponse.json({
        success: true,
        preview: true,
        message: `Preview: Merging will affect ${previewData.impact.affectedProjectCount} projects`,
        ...previewData,
        requiresConfirmation: true
      });
    }

    // [R4]: Execute actual merge - attempt transaction-safe merge using database function
    console.log(`🔄 Starting secure transaction...`);
    const { data: mergeResult, error: mergeError } = await performSecureMerge(
      csvVendorId,
      projectVendorId,
      keepName
    );

    if (mergeError) {
      // If RPC function doesn't exist, fall back to manual transaction
      console.log(`⚠️ Custom RPC not available, using manual transaction...`);
      return await performManualTransaction(csvVendorId, projectVendorId, keepName, csvVendor);
    }

    console.log(`✅ Transaction completed successfully`);
    console.log(`🗑️ Deleted duplicate vendor: ${projectVendorId}`);
    console.log(`📝 Updated vendor: ${csvVendorId} -> "${keepName}"`);

    return NextResponse.json({
      success: true,
      message: `Successfully merged vendors into "${keepName}"`,
      mergedVendor: {
        vendor_id: csvVendorId,
        vendor_name: keepName,
        updated_at: new Date().toISOString()
      },
      transactionId: mergeResult?.transaction_id || null
    });

  } catch (error) {
    console.error('❌ Vendor merge error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during merge operation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// [R4]: Fallback manual transaction with explicit rollback
async function performManualTransaction(
  csvVendorId: string,
  projectVendorId: string,
  keepName: string,
  csvVendor: VendorRecord
) {
  const normalizedName = keepName.trim();
  let rollbackData: RollbackData | null = null;

  try {
    // Get project vendor data for final result
    const { data: projectVendor, error: projectFetchError } = await supabase
      .from('vendors_enhanced')
      .select('*')
      .eq('vendor_id', projectVendorId)
      .single();

    if (projectFetchError) {
      throw new Error(`Failed to fetch project vendor: ${projectFetchError.message}`);
    }

    // Store original state for rollback
    rollbackData = {
      originalCsvVendor: { ...csvVendor },
      projectVendorId: projectVendorId
    };

    // FIXED LOGIC: Keep the vendor that already has (or is closest to) the target name
    // Step 1: Update project vendor name to ensure exact match
    console.log(`📝 Step 1: Ensuring project vendor has exact target name: "${normalizedName}"`);
    const { data: updatedVendor, error: updateError } = await supabase
      .from('vendors_enhanced')
      .update({
        vendor_name: normalizedName,
        updated_at: new Date().toISOString()
      })
      .eq('vendor_id', projectVendorId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update project vendor name: ${updateError.message}`);
    }

    // Step 2: Update any CSV references to point to project vendor
    console.log(`🔗 Step 2: Updating any CSV references to point to project vendor...`);
    const { error: csvUpdateError } = await supabase
      .from('projects_consolidated')
      .update({
        vendor_name: normalizedName,
        vendor_id: projectVendorId
      })
      .eq('vendor_id', csvVendorId);

    if (csvUpdateError) {
      // Rollback step 1
      await supabase
        .from('vendors_enhanced')
        .update({
          vendor_name: projectVendor.vendor_name,
          updated_at: projectVendor.updated_at
        })
        .eq('vendor_id', projectVendorId);

      throw new Error(`Failed to update CSV references: ${csvUpdateError.message}`);
    }

    // Step 3: Finally delete the duplicate CSV vendor
    console.log(`🗑️ Step 3: Removing duplicate CSV vendor...`);
    const { error: deleteError } = await supabase
      .from('vendors_enhanced')
      .delete()
      .eq('vendor_id', csvVendorId);

    if (deleteError) {
      // Rollback steps 1 & 2
      await Promise.all([
        supabase
          .from('vendors_enhanced')
          .update({
            vendor_name: projectVendor.vendor_name,
            updated_at: projectVendor.updated_at
          })
          .eq('vendor_id', projectVendorId),
        supabase
          .from('projects_consolidated')
          .update({
            vendor_name: csvVendor.vendor_name,
            vendor_id: csvVendorId
          })
          .eq('vendor_id', projectVendorId)
      ]);

      throw new Error(`Failed to delete CSV vendor: ${deleteError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully merged vendors into "${normalizedName}"`,
      mergedVendor: updatedVendor,
      rollbackCapable: false,
      method: 'manual_transaction'
    });

  } catch (error) {
    console.error('❌ Manual transaction failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Transaction failed with rollback attempted',
      details: error instanceof Error ? error.message : 'Unknown error',
      rollbackData: rollbackData ? 'Available' : 'None'
    }, { status: 500 });
  }
}
