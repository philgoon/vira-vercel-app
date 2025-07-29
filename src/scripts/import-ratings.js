// [R3] Import rating data from CSV to database
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Function to convert vendor name to vendor_id format
function getVendorId(vendorName) {
  // This is a simple mapping - you may need to adjust based on your actual vendor IDs
  const cleanName = vendorName.trim();
  
  // Map some known vendors to their IDs
  const vendorMap = {
    'Adaeze Nwakaeze': 'VEN-0007',
    'Alaiya Benjamin': 'VEN-0030',
    'Alex Silady': 'VEN-0005',
    'Allison Kirschbaum': 'VEN-0022',
    'Brad Riddell': 'VEN-0004',
    // Add more mappings as needed
  };
  
  return vendorMap[cleanName] || `VEN-${cleanName.replace(/\s+/g, '-').toLowerCase()}`;
}

async function importRatings() {
  try {
    console.log('Starting rating import...');
    
    // Read CSV file
    const csvPath = path.join(process.cwd(), 'converted_data', 'ratings_converted.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Found ${records.length} rating records`);
    
    // Convert to database format
    const ratings = records.map((record, index) => {
      const vendorId = getVendorId(record.vendor_name);
      
      return {
        rating_id: `RATING-${Date.now()}-${index}`,
        vendor_id: vendorId,
        project_id: `PROJ-${record.project_name?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}`,
        client_name: record.client_name || '',
        rater_email: 'imported@example.com',
        project_success_rating: parseInt(record.quality_rating) || 0,
        project_on_time: parseInt(record.turnaround_time_rating) >= 8,
        project_on_budget: true, // Assume true for imported data
        vendor_overall_rating: Math.round((
          (parseInt(record.quality_rating) || 0) + 
          (parseInt(record.communication_rating) || 0) + 
          (parseInt(record.reliability_rating) || 0) + 
          (parseInt(record.turnaround_time_rating) || 0)
        ) / 4),
        vendor_quality_rating: parseInt(record.quality_rating) || null,
        vendor_communication_rating: parseInt(record.communication_rating) || null,
        what_went_well: record.strengths || '',
        areas_for_improvement: record.weaknesses || '',
        recommend_again: (parseInt(record.quality_rating) || 0) >= 7,
        feedback: record.feedback || '',
        strengths: record.strengths || '',
        weaknesses: record.weaknesses || '',
        created_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    
    // Insert ratings in batches
    const batchSize = 20;
    let successCount = 0;
    
    for (let i = 0; i < ratings.length; i += batchSize) {
      const batch = ratings.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('vendor_ratings')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting batch:', error);
        console.log('Problematic batch:', batch.slice(0, 3)); // Show first 3 for debugging
      } else {
        successCount += batch.length;
        console.log(`Imported batch ${Math.floor(i/batchSize) + 1}, total so far: ${successCount}`);
      }
    }
    
    console.log(`Successfully imported ${successCount} ratings out of ${ratings.length} total`);
    
    // Verify import
    const { count } = await supabase
      .from('vendor_ratings')
      .select('*', { count: 'exact', head: true });
    
    console.log(`Total ratings in database: ${count}`);
    
  } catch (error) {
    console.error('Import failed:', error);
  }
}

// Run the import
importRatings().then(() => {
  console.log('Import completed');
  process.exit(0);
});