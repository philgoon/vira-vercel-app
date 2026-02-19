import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, isNextResponse } from '@/lib/clerk-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  try {
    console.log('🧹 Starting cleanup of duplicate ratings...');

    // Get all ratings to analyze duplicates
    const { data: allRatings, error: fetchError } = await supabase
      .from('ratings')
      .select('*')
      .order('created_date', { ascending: true });

    if (fetchError) throw fetchError;

    console.log(`📊 Found ${allRatings.length} total ratings`);

    // Identify newest records (those created today with imported@system.com)
    const today = new Date().toISOString().split('T')[0];
    const duplicateRecords = allRatings.filter(rating =>
      rating.rater_email === 'imported@system.com' &&
      rating.created_date?.startsWith(today)
    );

    console.log(`🗑️ Found ${duplicateRecords.length} duplicate records to remove`);

    // Delete duplicate records
    if (duplicateRecords.length > 0) {
      const duplicateIds = duplicateRecords.map(r => r.rating_id);

      const { error: deleteError } = await supabase
        .from('ratings')
        .delete()
        .in('rating_id', duplicateIds);

      if (deleteError) throw deleteError;

      console.log(`✅ Successfully removed ${duplicateRecords.length} duplicate records`);
    }

    // Verify cleanup
    const { data: remainingRatings, error: verifyError } = await supabase
      .from('ratings')
      .select('rating_id')
      .eq('rater_email', 'imported@system.com');

    if (verifyError) throw verifyError;

    console.log(`📋 Remaining ratings with imported@system.com: ${remainingRatings?.length || 0}`);
    console.log('🎉 Cleanup completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Duplicate cleanup completed successfully',
      duplicatesRemoved: duplicateRecords.length,
      remainingImported: remainingRatings?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
