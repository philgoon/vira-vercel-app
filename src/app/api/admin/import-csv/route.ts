import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import Papa from 'papaparse'

interface CSVRecord {
  'Ticket Assignee': string;
  'Ticket Title': string;
  'Ticket Company Name': string;
  'Ticket Created Date': string;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const fileContent = await file.text()

  let importedCount = 0
  let skippedDuplicates = 0
  let skippedUnknownVendors = 0

  const { data: records } = Papa.parse<CSVRecord>(fileContent, { header: true })

  for (const record of records) {
    const {
      'Ticket Assignee': assignee,
      'Ticket Title': title,
      'Ticket Company Name': company,
      'Ticket Created Date': createdDate,
    } = record;

    // 1. Vendor Validation
    const { data: vendor } = await supabaseAdmin
      .from('vendors')
      .select('vendor_id')
      .eq('vendor_name', assignee)
      .single()

    if (!vendor) {
      skippedUnknownVendors++
      continue
    }

    // 2. Project Deduplication
    const { data: existingProject } = await supabaseAdmin
      .from('projects')
      .select('project_id')
      .eq('project_title', title)
      .eq('client_name', company)
      .filter('created_at', 'gte', new Date(createdDate).toISOString().split('T')[0])
      .filter('created_at', 'lt', new Date(new Date(createdDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .single()

    if (existingProject) {
      skippedDuplicates++
      continue
    }

    // 3. Data Creation
    await supabaseAdmin.from('projects').insert({
      project_title: title,
      client_name: company,
      created_at: new Date(createdDate).toISOString(),
      vendor_id: vendor.vendor_id,
      // Map other fields from the CSV here if necessary
    })

    importedCount++
  }

  return NextResponse.json({
    success: true,
    imported: importedCount,
    skipped_duplicates: skippedDuplicates,
    skipped_unknown_vendors: skippedUnknownVendors,
  })
}
