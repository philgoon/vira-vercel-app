// [R5.1] Data migration script to populate Supabase from CSV files
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { parse } from 'csv-parse';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface VendorCSVRow {
  'Vendor ID': string;
  'Name/Company Name': string;
  'Type': string;
  'Status': string;
  'Primary Contact': string;
  'Email': string;
  'Time Zone': string;
  'Contact Preference': string;
  'Onboarding Date': string;
  'Overall Rating': string;
  'Industry': string;
  'Service Category': string;
  'Skills': string;
  'Portfolio URL': string;
  'Sample Work URLs': string;
  'Pricing Structure': string;
  'Rate/Cost': string;
  'Availability': string;
}

interface ProjectCSVRow {
  'Client Name': string;
  'Project Name': string;
  'Due Date': string;
}

interface RatingCSVRow {
  'Vendor ID': string;
  'Quality': string;
  'Communication': string;
  'Reliability': string;
  'Turnaround Time': string;
  'Feedback': string;
  'Client Name': string;
  'Project Type': string;
  'Project Details': string;
  'Strengths': string;
  'Weaknesses': string;
}

async function parseCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // Handle various date formats from CSV
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  } catch {
    return null;
  }
}

async function migrateVendors() {
  console.log('📁 Migrating vendors...');
  
  try {
    const vendorData = await parseCSV<VendorCSVRow>('./vendors.csv');
    
    const vendors = vendorData
      .filter(row => row['Name/Company Name'] && row['Name/Company Name'].trim() !== '')
      .map(row => ({
        vendor_id: row['Vendor ID']?.trim() || row['Name/Company Name']?.trim(),
        name: row['Name/Company Name']?.trim(),
        type: row['Type']?.trim() || null,
        status: row['Status']?.trim() || 'Active',
        primary_contact: row['Primary Contact']?.trim() || null,
        email: row['Email']?.trim() || null,
        time_zone: row['Time Zone']?.trim() || null,
        contact_preference: row['Contact Preference']?.trim() || null,
        onboarding_date: parseDate(row['Onboarding Date']),
        overall_rating: row['Overall Rating'] ? parseFloat(row['Overall Rating']) : null,
        industry: row['Industry']?.trim() || null,
        service_category: row['Service Category']?.trim() || null,
        skills: row['Skills']?.trim() || null,
        portfolio_url: row['Portfolio URL']?.trim() || null,
        sample_work_urls: row['Sample Work URLs']?.trim() || null,
        pricing_structure: row['Pricing Structure']?.trim() || null,
        rate_cost: row['Rate/Cost']?.trim() || null,
        availability: row['Availability']?.trim() || null,
      }));

    const { data, error } = await supabase
      .from('vendors')
      .insert(vendors);

    if (error) throw error;
    
    console.log(`✅ Successfully migrated ${vendors.length} vendors`);
  } catch (error) {
    console.error('❌ Error migrating vendors:', error);
  }
}

async function migrateClients() {
  console.log('👥 Migrating clients...');
  
  try {
    const projectData = await parseCSV<ProjectCSVRow>('./projects.csv');
    
    // Extract unique client names from projects
    const uniqueClients = [...new Set(
      projectData
        .map(row => row['Client Name']?.trim())
        .filter(name => name && name !== '')
    )];
    
    const clients = uniqueClients.map(name => ({
      name,
      status: 'active'
    }));

    const { data, error } = await supabase
      .from('clients')
      .insert(clients);

    if (error) throw error;
    
    console.log(`✅ Successfully migrated ${clients.length} clients`);
  } catch (error) {
    console.error('❌ Error migrating clients:', error);
  }
}

async function migrateProjects() {
  console.log('📋 Migrating projects...');
  
  try {
    const projectData = await parseCSV<ProjectCSVRow>('./projects.csv');
    
    const projects = projectData
      .filter(row => row['Project Name'] && row['Project Name'].trim() !== '')
      .map(row => ({
        client_name: row['Client Name']?.trim(),
        project_name: row['Project Name']?.trim(),
        due_date: parseDate(row['Due Date']),
        status: 'active'
      }));

    const { data, error } = await supabase
      .from('projects')
      .insert(projects);

    if (error) throw error;
    
    console.log(`✅ Successfully migrated ${projects.length} projects`);
  } catch (error) {
    console.error('❌ Error migrating projects:', error);
  }
}

async function migrateRatings() {
  console.log('⭐ Migrating vendor ratings...');
  
  try {
    const ratingData = await parseCSV<RatingCSVRow>('./vendor ratings.csv');
    
    // First, get all vendors to map vendor IDs
    const { data: vendors } = await supabase
      .from('vendors')
      .select('id, vendor_id, name');
    
    const vendorMap = new Map();
    vendors?.forEach(vendor => {
      vendorMap.set(vendor.vendor_id, vendor.id);
      vendorMap.set(vendor.name, vendor.id);
    });
    
    const ratings = ratingData
      .filter(row => row['Vendor ID'] && row['Vendor ID'].trim() !== '')
      .map(row => {
        const vendorIdentifier = row['Vendor ID']?.trim();
        const vendorId = vendorMap.get(vendorIdentifier);
        
        if (!vendorId) {
          console.warn(`⚠️ Could not find vendor for: ${vendorIdentifier}`);
          return null;
        }
        
        return {
          vendor_id: vendorId,
          quality_rating: row['Quality'] ? parseInt(row['Quality']) : null,
          communication_rating: row['Communication'] ? parseInt(row['Communication']) : null,
          reliability_rating: row['Reliability'] ? parseInt(row['Reliability']) : null,
          turnaround_time_rating: row['Turnaround Time'] ? parseInt(row['Turnaround Time']) : null,
          feedback: row['Feedback']?.trim() || null,
          client_name: row['Client Name']?.trim() || null,
          project_type: row['Project Type']?.trim() || null,
          project_details: row['Project Details']?.trim() || null,
          strengths: row['Strengths']?.trim() || null,
          weaknesses: row['Weaknesses']?.trim() || null,
        };
      })
      .filter(rating => rating !== null);

    const { data, error } = await supabase
      .from('vendor_ratings')
      .insert(ratings);

    if (error) throw error;
    
    console.log(`✅ Successfully migrated ${ratings.length} vendor ratings`);
  } catch (error) {
    console.error('❌ Error migrating ratings:', error);
  }
}

async function main() {
  console.log('🚀 Starting data migration to Supabase...\n');
  
  // Run migrations in order
  await migrateVendors();
  await migrateClients();
  await migrateProjects();
  await migrateRatings();
  
  console.log('\n🎉 Migration completed!');
}

// Run the migration
main().catch(console.error);

export default main;
