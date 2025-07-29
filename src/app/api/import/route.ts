import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ImportResult {
  success: boolean
  message: string
  details?: {
    imported: number
    skipped: number
    errors: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file provided',
      })
    }

    const text = await file.text()
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    let result: ImportResult

    switch (type) {
      case 'vendors':
        result = await importVendors(records)
        break
      case 'projects':
        result = await importProjects(records)
        break
      case 'ratings':
        result = await importRatings(records)
        break
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid import type',
        })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({
      success: false,
      message: 'Import failed. Please check your file format.',
    })
  }
}

async function importVendors(records: any[]): Promise<ImportResult> {
  let imported = 0
  let skipped = 0
  const errors: string[] = []

  for (const record of records) {
    try {
      // Check if vendor already exists
      const { data: existing } = await supabase
        .from('vendors')
        .select('vendor_id')
        .eq('vendor_name', record.name)
        .single()

      if (existing) {
        skipped++
        continue
      }

      // Generate next vendor ID
      const { count } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
      const nextVendorId = `VEN-${String((count || 0) + 1).padStart(4, '0')}`

      // Insert new vendor
      const { error } = await supabase.from('vendors').insert({
        vendor_id: nextVendorId,
        vendor_name: record.name,
        contact_name: record.primary_contact || null,
        contact_email: record.email || null,
        service_categories: record.service_category || null,
        specialties: record.skills || null,
        pricing_notes: record.pricing_structure || null,
        time_zone: record.time_zone || null,
        status: 'active',
      })

      if (error) throw error
      imported++
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error'
      errors.push(`Failed to import vendor "${record.name}": ${errorMessage}`)
    }
  }

  return {
    success: imported > 0,
    message: `Import completed. ${imported} vendors imported, ${skipped} skipped.`,
    details: { imported, skipped, errors },
  }
}

async function importProjects(records: any[]): Promise<ImportResult> {
  let imported = 0
  let skipped = 0
  const errors: string[] = []

  console.log('Starting project import, records:', records.length)

  for (const record of records) {
    try {
      console.log('Processing project:', record.project_name)
      // Get or create client
      let clientId: number
      const { data: existingClient } = await supabase
        .from('clients')
        .select('client_id')
        .eq('client_name', record.client_name)
        .single()

      if (existingClient) {
        clientId = existingClient.client_id
      } else {
        // Generate next client ID
        const { count } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
        const nextClientId = `CLI-${String((count || 0) + 1).padStart(4, '0')}`

        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({ 
            client_id: nextClientId,
            client_name: record.client_name 
          })
          .select('client_id')
          .single()

        if (clientError) throw clientError
        clientId = newClient.client_id
      }

      // Get vendor ID if vendor name provided
      let vendorId: number | null = null
      if (record.vendor_name) {
        const { data: vendor } = await supabase
          .from('vendors')
          .select('vendor_id')
          .eq('vendor_name', record.vendor_name)
          .single()

        if (vendor) {
          vendorId = vendor.vendor_id
        } else {
          errors.push(`Vendor "${record.vendor_name}" not found for project "${record.project_name}"`)
        }
      }

      // Generate next project ID
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
      const nextProjectId = `PRJ-${String((projectCount || 0) + 1).padStart(4, '0')}`

      // Insert project
      const { error } = await supabase.from('projects').insert({
        project_id: nextProjectId,
        client_id: clientId,
        project_title: record.project_name,
        assigned_vendor_id: vendorId,
        expected_deadline: record.due_date || null,
        status: record.status || 'active',
        project_description: record.description || null,
      })

      if (error) throw error
      imported++
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error'
      errors.push(`Failed to import project "${record.project_name}": ${errorMessage}`)
    }
  }

  return {
    success: imported > 0,
    message: `Import completed. ${imported} projects imported, ${skipped} skipped.`,
    details: { imported, skipped, errors },
  }
}

async function importRatings(records: any[]): Promise<ImportResult> {
  let imported = 0
  let skipped = 0
  const errors: string[] = []

  for (const record of records) {
    try {
      // Get vendor ID
      const { data: vendor } = await supabase
        .from('vendors')
        .select('vendor_id')
        .eq('vendor_name', record.vendor_name)
        .single()

      if (!vendor) {
        errors.push(`Vendor "${record.vendor_name}" not found`)
        continue
      }

      // Generate rating ID
      const { count: ratingCount } = await supabase
        .from('ratings')
        .select('*', { count: 'exact', head: true })
      const nextRatingId = `RAT-${Date.now()}`

      // Insert rating
      const { error } = await supabase.from('ratings').insert({
        rating_id: nextRatingId,
        vendor_id: vendor.vendor_id,
        project_id: null, // We don't have project mapping in CSV
        client_id: null,  // We don't have client mapping in CSV
        rater_email: 'imported@system.com', // Placeholder for imported data
        vendor_quality_rating: parseInt(record.quality_rating) || null,
        vendor_communication_rating: parseInt(record.communication_rating) || null,
        vendor_overall_rating: parseInt(record.reliability_rating) || null,
        project_success_rating: parseInt(record.turnaround_time_rating) || null,
        what_went_well: record.strengths || null,
        areas_for_improvement: record.weaknesses || null,
        recommend_again: record.feedback?.toLowerCase().includes('yes') || null,
        project_on_time: true, // Default for imported data
        project_on_budget: true, // Default for imported data
        rating_date: new Date().toISOString().split('T')[0],
      })

      if (error) throw error
      imported++
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error'
      errors.push(`Failed to import rating for "${record.vendor_name}": ${errorMessage}`)
    }
  }

  return {
    success: imported > 0,
    message: `Import completed. ${imported} ratings imported, ${skipped} skipped.`,
    details: { imported, skipped, errors },
  }
}