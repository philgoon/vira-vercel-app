/**
 * Accelo Relationship Repair Script
 *
 * Purpose: Restore broken project-vendor-rating relationships from original Accelo export
 * Context: Original import split unified data into separate tables, breaking foreign key relationships
 *
 * Features:
 * - Maps projects to vendors using original Accelo data
 * - Converts 10-point ratings to 5-point scale for ViRA compatibility
 * - Creates missing ratings records with proper relationships
 * - Supports future imports without ratings (relationships only)
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
  ticketAssignee: string;      // Vendor name
  ticketTitle: string;         // Project name
  ticketCompanyName: string;   // Client name
  projectSuccessRating: string; // Rating (1-10, convert to 1-5)
  overallVendorRating: string; // Overall rating (1-10, convert to 1-5)
  workQualityRating: string;   // Quality rating (1-10, convert to 1-5)
  communicationRating: string; // Communication rating (1-10, convert to 1-5)
}

interface DatabaseRecord {
  projects: Array<{ project_id: string, project_title: string }>;
  vendors: Array<{ vendor_id: string, vendor_name: string }>;
  clients: Array<{ client_id: string, client_name: string }>;
}

/**
 * Convert 10-point rating to 5-point scale
 * Handles empty/invalid ratings gracefully
 */
function convertRating(rating: string): number | null {
  const numRating = parseFloat(rating);
  if (isNaN(numRating) || numRating === 0) return null;

  // Convert 10-point to 5-point: Math.round(rating/2)
  // But ensure minimum of 1 if original rating exists
  const converted = Math.round(numRating / 2);
  return Math.max(1, converted);
}

/**
 * Parse original Accelo CSV data
 */
function parseAcceloData(csvPath: string): AcceloRow[] {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');

  const rows: AcceloRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',');
    if (values.length < 14) continue; // Skip incomplete rows

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
 * Fetch current database records
 */
async function fetchDatabaseRecords(): Promise<DatabaseRecord> {
  const [projectsResult, vendorsResult, clientsResult] = await Promise.all([
    supabase.from('projects').select('project_id, project_title'),
    supabase.from('vendors').select('vendor_id, vendor_name'),
    supabase.from('clients').select('client_id, client_name')
  ]);

  if (projectsResult.error) throw projectsResult.error;
  if (vendorsResult.error) throw vendorsResult.error;
  if (clientsResult.error) throw clientsResult.error;

  return {
    projects: projectsResult.data || [],
    vendors: vendorsResult.data || [],
    clients: clientsResult.data || []
  };
}

/**
 * Find best matching vendor by name similarity
 */
function findBestVendorMatch(vendorName: string, vendors: Array<{ vendor_id: string, vendor_name: string }>): string | null {
  if (!vendorName) return null;

  // Direct exact match
  const exactMatch = vendors.find(v =>
    v.vendor_name.toLowerCase() === vendorName.toLowerCase()
  );
  if (exactMatch) return exactMatch.vendor_id;

  // Partial match (contains)
  const partialMatch = vendors.find(v =>
    v.vendor_name.toLowerCase().includes(vendorName.toLowerCase()) ||
    vendorName.toLowerCase().includes(v.vendor_name.toLowerCase())
  );
  if (partialMatch) return partialMatch.vendor_id;

  return null;
}

/**
 * Find best matching project by title similarity
 */
function findBestProjectMatch(projectTitle: string, projects: Array<{ project_id: string, project_title: string }>): string | null {
  if (!projectTitle) return null;

  // Direct exact match
  const exactMatch = projects.find(p =>
    p.project_title.toLowerCase() === projectTitle.toLowerCase()
  );
  if (exactMatch) return exactMatch.project_id;

  // Partial match - project title contains CSV title or vice versa
  const partialMatch = projects.find(p =>
    p.project_title.toLowerCase().includes(projectTitle.toLowerCase()) ||
    projectTitle.toLowerCase().includes(p.project_title.toLowerCase())
  );
  if (partialMatch) return partialMatch.project_id;

  return null;
}

/**
 * Main repair function
 */
async function repairAcceloRelationships() {
  console.log('🔧 Starting Accelo relationship repair...');

  try {
    // 1. Load original Accelo data
    const csvPath = path.join(process.cwd(), 'ViRA _ Accelo Ticket Export - Sheet1.csv');
    const acceloData = parseAcceloData(csvPath);
    console.log(`📊 Parsed ${acceloData.length} Accelo records`);

    // 2. Fetch current database records
    const dbRecords = await fetchDatabaseRecords();
    console.log(`🗄️ Found ${dbRecords.projects.length} projects, ${dbRecords.vendors.length} vendors`);

    // 3. Create relationship mappings
    const ratingsToInsert = [];
    const mappingStats = { matched: 0, skipped: 0, errors: 0 };

    for (const row of acceloData) {
      try {
        const projectId = findBestProjectMatch(row.ticketTitle, dbRecords.projects);
        const vendorId = findBestVendorMatch(row.ticketAssignee, dbRecords.vendors);

        if (!projectId || !vendorId) {
          mappingStats.skipped++;
          console.log(`⚠️ Skipped: ${row.ticketTitle} - ${row.ticketAssignee} (no match)`);
          continue;
        }

        // Find matching client
        const clientMatch = dbRecords.clients.find(c =>
          c.client_name?.toLowerCase().includes(row.ticketCompanyName.toLowerCase()) ||
          row.ticketCompanyName.toLowerCase().includes(c.client_name?.toLowerCase() || '')
        );
        const clientId = clientMatch?.client_id || 'CLI-UNKNOWN';

        // Convert ratings from 10-point to 5-point scale
        const ratingRecord = {
          rating_id: `RAT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          project_id: projectId,
          vendor_id: vendorId,
          client_id: clientId,
          rater_email: 'imported@system.com',
          rating_date: new Date().toISOString().split('T')[0], // Date only
          project_success_rating: convertRating(row.projectSuccessRating),
          project_on_time: true, // Default from Accelo data
          project_on_budget: true, // Default from Accelo data
          vendor_overall_rating: convertRating(row.overallVendorRating),
          vendor_quality_rating: convertRating(row.workQualityRating),
          vendor_communication_rating: convertRating(row.communicationRating),
          what_went_well: null, // No notes field in Accelo data
          areas_for_improvement: null,
          recommend_again: null,
          created_date: new Date().toISOString()
        };

        ratingsToInsert.push(ratingRecord);
        mappingStats.matched++;

      } catch (error) {
        mappingStats.errors++;
        console.error(`❌ Error processing row: ${row.ticketTitle}`, error);
      }
    }

    console.log(`📈 Mapping Stats: ${mappingStats.matched} matched, ${mappingStats.skipped} skipped, ${mappingStats.errors} errors`);

    // 4. Insert ratings records to establish relationships
    if (ratingsToInsert.length > 0) {
      console.log(`💾 Inserting ${ratingsToInsert.length} rating records...`);

      // Use Supabase's native upsert - handles duplicates automatically
      const { error } = await supabase
        .from('ratings')
        .upsert(ratingsToInsert);

      if (error) {
        console.error('❌ Insert error:', error);
        throw error;
      }

      console.log('✅ Successfully inserted rating records');
    }

    console.log('🎉 Accelo relationship repair completed!');

  } catch (error) {
    console.error('💥 Repair failed:', error);
    throw error;
  }
}

// Run repair if called directly
if (require.main === module) {
  repairAcceloRelationships()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { repairAcceloRelationships };
