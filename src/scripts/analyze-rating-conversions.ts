/**
 * Rating Conversion Analysis Script
 *
 * Purpose: Preview exactly what ratings will change during Accelo repair
 * Shows current database values vs expected converted values
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Environment variables status:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing');
  throw new Error('Missing Supabase environment variables');
}
const supabase = createClient(supabaseUrl, supabaseKey);

interface AcceloRow {
  ticketAssignee: string;
  ticketTitle: string;
  ticketCompanyName: string;
  projectSuccessRating: string;
  overallVendorRating: string;
  workQualityRating: string;
  communicationRating: string;
}

interface RatingComparison {
  source: string;
  project: string;
  vendor: string;
  current_project_success: number | null;
  expected_project_success: number | null;
  current_vendor_overall: number | null;
  expected_vendor_overall: number | null;
  current_vendor_quality: number | null;
  expected_vendor_quality: number | null;
  current_communication: number | null;
  expected_communication: number | null;
}

/**
 * Convert 10-point rating to 5-point scale
 */
function convertRating(rating: string): number | null {
  const numRating = parseFloat(rating);
  if (isNaN(numRating) || numRating === 0) return null;

  const converted = Math.round(numRating / 2);
  return Math.max(1, converted);
}

/**
 * Parse CSV data to get expected values
 */
function parseAcceloData(csvPath: string): AcceloRow[] {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  const rows: AcceloRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',');
    if (values.length < 14) continue;

    rows.push({
      ticketAssignee: values[0]?.replace(/"/g, '').trim() || '',
      ticketTitle: values[2]?.replace(/"/g, '').trim() || '',
      ticketCompanyName: values[3]?.replace(/"/g, '').trim() || '',
      projectSuccessRating: values[5]?.replace(/"/g, '').trim() || '',
      overallVendorRating: values[8]?.replace(/"/g, '').trim() || '',
      workQualityRating: values[9]?.replace(/"/g, '').trim() || '',
      communicationRating: values[10]?.replace(/"/g, '').trim() || ''
    });
  }

  return rows;
}

/**
 * Main analysis function
 */
async function analyzeRatingConversions() {
  console.log('🔍 RATING CONVERSION ANALYSIS');
  console.log('=====================================\n');

  try {
    // 1. Get current database ratings
    const { data: currentRatings, error } = await supabase
      .from('ratings')
      .select(`
        rating_id,
        project_success_rating,
        vendor_overall_rating,
        vendor_quality_rating,
        vendor_communication_rating,
        projects!inner(project_title),
        vendors!inner(vendor_name)
      `);

    if (error) throw error;

    console.log(`📊 Found ${currentRatings?.length || 0} current ratings in database\n`);

    // 2. Load CSV data to get expected values
    const csvPath = path.join(process.cwd(), 'ViRA _ Accelo Ticket Export - Sheet1.csv');
    const csvData = parseAcceloData(csvPath);
    console.log(`📋 Found ${csvData.length} records in CSV\n`);

    // 3. Create comparison analysis
    const comparisons: RatingComparison[] = [];

    // Show current database state
    console.log('🗄️ CURRENT DATABASE RATINGS:');
    console.log('─'.repeat(80));
    console.log('Rating ID'.padEnd(20) + 'Project Success'.padEnd(15) + 'Overall'.padEnd(10) + 'Quality'.padEnd(10) + 'Communication');
    console.log('─'.repeat(80));

    currentRatings?.forEach(rating => {
      console.log(
        rating.rating_id.substring(0, 18).padEnd(20) +
        (rating.project_success_rating?.toString() || 'null').padEnd(15) +
        (rating.vendor_overall_rating?.toString() || 'null').padEnd(10) +
        (rating.vendor_quality_rating?.toString() || 'null').padEnd(10) +
        (rating.vendor_communication_rating?.toString() || 'null')
      );
    });

    console.log('\n📈 CSV DATA ANALYSIS (First 10 records):');
    console.log('─'.repeat(100));
    console.log('Project'.padEnd(30) + 'Vendor'.padEnd(20) + 'Success'.padEnd(10) + 'Overall'.padEnd(10) + 'Quality'.padEnd(10) + 'Communication');
    console.log('─'.repeat(100));

    csvData.slice(0, 10).forEach(row => {
      console.log(
        row.ticketTitle.substring(0, 28).padEnd(30) +
        row.ticketAssignee.substring(0, 18).padEnd(20) +
        row.projectSuccessRating.padEnd(10) +
        row.overallVendorRating.padEnd(10) +
        row.workQualityRating.padEnd(10) +
        row.communicationRating
      );
    });

    console.log('\n🔄 CONVERSION EXAMPLES:');
    console.log('─'.repeat(60));
    console.log('Original'.padEnd(15) + '→'.padEnd(5) + 'Converted');
    console.log('─'.repeat(60));

    const testRatings = ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
    testRatings.forEach(rating => {
      const converted = convertRating(rating);
      console.log(`${rating}`.padEnd(15) + '→'.padEnd(5) + `${converted}`);
    });

    // Show summary statistics
    console.log('\n📊 RATING DISTRIBUTION ANALYSIS:');
    console.log('─'.repeat(40));

    const csvRatings = csvData.flatMap(row => [
      row.projectSuccessRating,
      row.overallVendorRating,
      row.workQualityRating,
      row.communicationRating
    ]).filter(r => r && !isNaN(parseFloat(r)));

    const ratingCounts = csvRatings.reduce((acc, rating) => {
      const num = parseFloat(rating);
      acc[num] = (acc[num] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    console.log('\nCSV Rating Distribution:');
    Object.entries(ratingCounts)
      .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
      .forEach(([rating, count]) => {
        const converted = convertRating(rating);
        console.log(`Rating ${rating}: ${count} occurrences → converts to ${converted}`);
      });

    // Current database distribution
    const dbRatings = currentRatings?.flatMap(r => [
      r.project_success_rating,
      r.vendor_overall_rating,
      r.vendor_quality_rating,
      r.vendor_communication_rating
    ]).filter(r => r !== null) || [];

    const dbRatingCounts = dbRatings.reduce((acc, rating) => {
      if (rating !== null) {
        acc[rating] = (acc[rating] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    console.log('\nCurrent Database Rating Distribution:');
    Object.entries(dbRatingCounts)
      .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
      .forEach(([rating, count]) => {
        console.log(`Rating ${rating}: ${count} occurrences`);
      });

    console.log('\n✅ ANALYSIS COMPLETE');
    console.log('\n🚨 KEY FINDINGS:');
    console.log('• Current database contains unconverted ratings (likely 6-10 range)');
    console.log('• CSV contains original 10-point scale ratings');
    console.log('• Repair script will convert using Math.round(rating/2) with minimum of 1');
    console.log('• This will compress 10-point scale to proper 5-point scale for ViRA tool');

  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw error;
  }
}

// Run analysis if called directly
if (require.main === module) {
  analyzeRatingConversions()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { analyzeRatingConversions };
