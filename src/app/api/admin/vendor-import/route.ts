// [R3]: Vendor Import API - Import vendors.csv directly to vendors_enhanced table
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, isNextResponse } from '@/lib/clerk-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface VendorRecord {
  vendor_id?: string;
  vendor_name: string;
  vendor_type: string;
  vendor_status: string;
  primary_contact: string;
  email: string;
  time_zone?: string;
  contact_preference?: string;
  onboarding_date?: string;
  overall_rating?: number;
  industry?: string;
  service_category?: string;
  skills?: string;
  portfolio_url?: string;
  sample_work_urls?: string;
  pricing_structure?: string;
  rate_cost?: string;
  availability?: string;
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const csvContent = await file.text();
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      return NextResponse.json({ success: false, error: 'CSV must have header and data rows' }, { status: 400 });
    }

    // Parse header
    const headers = parseCsvRow(lines[0]);
    console.log('📋 Vendor CSV headers:', headers);

    // Parse vendor records
    const vendorRecords: VendorRecord[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvRow(lines[i]);
      
      if (row.length === 0 || row.every(cell => !cell.trim())) {
        continue; // Skip empty rows
      }

      try {
        const record = parseVendorRow(headers, row);
        if (record.vendor_name && record.vendor_type) {
          vendorRecords.push(record);
        } else {
          // Only log error if the row has some data but missing key fields
          const hasData = row.some(cell => cell.trim() !== '');
          if (hasData) {
            console.log(`⚠️ Row ${i + 1}: Skipping - missing vendor name or type. Data: ${row.slice(0,3).join('|')}`);
          }
        }
      } catch (error) {
        console.log(`⚠️ Row ${i + 1}: Parse error - ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    if (vendorRecords.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid vendor records found in CSV'
      }, { status: 400 });
    }

    console.log(`🚀 Importing ${vendorRecords.length} vendors...`);

    // Insert vendors into vendors_enhanced table
    const { data, error } = await supabase
      .from('vendors_enhanced')
      .insert(vendorRecords)
      .select();

    if (error) {
      console.error('Vendor import error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database insert failed',
        details: error.message
      }, { status: 500 });
    }

    console.log(`✅ Successfully imported ${data?.length || 0} vendors`);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${data?.length || 0} vendors`,
      imported: data?.length || 0,
      vendors: vendorRecords.map(v => v.vendor_name)
    });

  } catch (error) {
    console.error('Vendor import API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function parseVendorRow(headers: string[], row: string[]): VendorRecord {
  const record: Partial<VendorRecord> = {};

  // Map CSV columns to database fields
  for (let i = 0; i < Math.min(headers.length, row.length); i++) {
    const header = headers[i].trim();
    const value = row[i].trim();

    switch (header) {
      case 'Name/Company Name':
        record.vendor_name = value;
        // Generate vendor_id as slug from vendor_name
        record.vendor_id = value.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);
        break;
      case 'Type':
        record.vendor_type = value;
        break;
      case 'Status':
        record.vendor_status = value;
        break;
      case 'Primary Contact':
        record.primary_contact = value;
        break;
      case 'Email':
        record.email = value;
        break;
      case 'Time Zone':
        record.time_zone = value;
        break;
      case 'Contact Preference':
        record.contact_preference = value;
        break;
      case 'Onboarding Date':
        record.onboarding_date = value;
        break;
      case 'Overall Rating':
        record.overall_rating = value ? parseFloat(value) : undefined;
        break;
      case 'Industry':
        record.industry = value;
        break;
      case 'Service Category':
        record.service_category = value;
        break;
      case 'Skills':
        record.skills = value;
        break;
      case 'Portfolio URL':
        record.portfolio_url = value;
        break;
      case 'Sample Work URLs':
        record.sample_work_urls = value;
        break;
      case 'Pricing Structure':
        record.pricing_structure = value;
        break;
      case 'Rate/Cost':
        record.rate_cost = value;
        break;
      case 'Availability':
        record.availability = value;
        break;
    }
  }

  return record as VendorRecord;
}

function parseCsvRow(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}