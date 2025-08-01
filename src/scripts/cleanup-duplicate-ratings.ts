/**
* Cleanup Duplicate Ratings Script
*
* Purpose: Remove duplicate ratings records created by repair script
* Issue: Repair script created duplicates and rating conversion failed
*/

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupDuplicateRatings() {
  console.log('🧹 Starting cleanup of duplicate ratings...');

  try {
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

  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    throw error;
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupDuplicateRatings()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { cleanupDuplicateRatings };
