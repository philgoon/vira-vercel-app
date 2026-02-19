import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import Papa from 'papaparse'
import OpenAI from 'openai'
import { generateProjectEmbedding } from '@/lib/embeddings'
import { requireAuth, isNextResponse } from '@/lib/clerk-auth'

interface CSVRecord {
  'Ticket Title': string;
  'Ticket Description': string;
  'Ticket Assignee': string;
  'Ticket Submitted By': string;
  'Ticket Company Name': string;
  'Ticket Status': string;
  'Ticket Created Date': string;
  'Ticket Closed Date': string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// Generate AI summary (20-30 words) for ViRA Match optimization
// TODO: Switch to 'gpt-5-nano' when available (see ADR-001)
// Reason: Designed for bulk summaries, ultra-low latency, high-volume tasks
async function generateProjectSummary(description: string): Promise<string> {
  if (!description || description.trim().length === 0) {
    return ''
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Current model
      // TODO: Change to 'gpt-5-nano' when available (ADR-001)
      messages: [
        {
          role: 'system',
          content: 'You are a concise project summarizer. Extract the core essence of projects in exactly 20-30 words. Focus on: what was done, the domain/industry, and key deliverables. Be specific and actionable.'
        },
        {
          role: 'user',
          content: `Summarize this project in 20-30 words:\n\n${description}`
        }
      ],
      temperature: 0.3, // More focused, less creative
      max_tokens: 60 // Roughly 20-30 words
    })

    return response.choices[0]?.message?.content?.trim() || ''
  } catch (error) {
    console.error('OpenAI summary generation failed:', error)
    // Fallback: Use first 30 words of description
    return description.split(/\s+/).slice(0, 30).join(' ')
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  const formData = await req.formData()
  const file = formData.get('file') as File
  const confirmImport = formData.get('confirm') === 'true' // Two-step: preview then confirm
  const selectedIndicesStr = formData.get('selectedIndices') as string
  const selectedIndices = selectedIndicesStr ? new Set(JSON.parse(selectedIndicesStr)) : null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const fileContent = await file.text()

  let importedCount = 0
  let skippedDuplicates = 0
  let skippedUnknownVendors = 0
  let summariesGenerated = 0
  let reviewersAutoAssigned = 0
  const projectResults: any[] = [] // Detailed per-project results

  const { data: records } = Papa.parse<CSVRecord>(fileContent, { header: true })

  // ========================================
  // STEP 1: PREVIEW MODE (if not confirmed)
  // ========================================
  if (!confirmImport) {
    // Just validate and show preview, don't write to database
    const previewResults: any[] = []
    
    for (const record of records) {
      const {
        'Ticket Title': title,
        'Ticket Description': description,
        'Ticket Assignee': assignee,
        'Ticket Submitted By': submittedBy,
        'Ticket Company Name': company,
        'Ticket Status': ticketStatus,
        'Ticket Created Date': createdDate,
        'Ticket Closed Date': closedDate,
      } = record

      // Validate vendor exists
      const { data: vendor } = await supabaseAdmin
        .from('vendors')
        .select('vendor_id, vendor_name')
        .eq('vendor_name', assignee)
        .single()

      // Check for duplicates (only if we have a valid date)
      let isDuplicate = false
      if (createdDate) {
        try {
          const startDate = new Date(createdDate).toISOString().split('T')[0]
          const endDate = new Date(new Date(createdDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          
          const { data: existingProject } = await supabaseAdmin
            .from('projects')
            .select('project_id')
            .eq('project_title', title)
            .eq('client_name', company)
            .filter('created_at', 'gte', startDate)
            .filter('created_at', 'lt', endDate)
            .maybeSingle() // Use maybeSingle() - returns null if not found
          
          isDuplicate = !!existingProject
        } catch (e) {
          // Date parsing failed, skip duplicate check
          console.error('Date parsing error:', e)
        }
      }

      previewResults.push({
        title,
        company,
        vendor_name: assignee,
        vendor_found: !!vendor,
        is_duplicate: isDuplicate,
        submitted_by: submittedBy,
        ticket_status: ticketStatus,
        has_description: !!description,
        created_date: createdDate
      })
    }

    return NextResponse.json({
      preview: true,
      total_records: records.length,
      preview_data: previewResults,
      message: 'Review the import preview and confirm to proceed'
    })
  }

  // ========================================
  // STEP 2: CONFIRMED IMPORT (write to DB)
  // ========================================
  for (let recordIndex = 0; recordIndex < records.length; recordIndex++) {
    // Skip if not selected
    if (selectedIndices && !selectedIndices.has(recordIndex)) {
      continue
    }
    
    const record = records[recordIndex]
    const {
      'Ticket Title': title,
      'Ticket Description': description,
      'Ticket Assignee': assignee,
      'Ticket Submitted By': submittedBy,
      'Ticket Company Name': company,
      'Ticket Status': ticketStatus,
      'Ticket Created Date': createdDate,
      'Ticket Closed Date': closedDate,
    } = record;

    // 1. Vendor Validation
    const { data: vendor } = await supabaseAdmin
      .from('vendors')
      .select('vendor_id')
      .eq('vendor_name', assignee)
      .single()

    if (!vendor) {
      skippedUnknownVendors++
      projectResults.push({
        title,
        company,
        status: 'skipped',
        reason: 'Vendor not found',
        vendor_name: assignee
      })
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
      projectResults.push({
        title,
        company,
        status: 'skipped',
        reason: 'Duplicate project',
        vendor_name: assignee
      })
      continue
    }

    // 3. Look up reviewer BEFORE creating project (if submittedBy exists)
    let matchedReviewer = null
    if (submittedBy) {
      const { data: reviewer } = await supabaseAdmin
        .from('user_profiles')
        .select('user_id, full_name, email, role')
        .ilike('full_name', submittedBy)
        .in('role', ['admin', 'team'])
        .eq('is_active', true)
        .single()
      
      if (reviewer) {
        matchedReviewer = reviewer
      }
    }

    // 4. Generate AI Summary (20-30 words)
    const projectSummary = await generateProjectSummary(description || title)
    if (projectSummary) {
      summariesGenerated++
    }

    // 4b. Generate Embedding for Semantic Search (if description exists)
    let descriptionEmbedding = null
    if (description && description.trim().length > 0) {
      try {
        descriptionEmbedding = await generateProjectEmbedding(title, description)
        console.log(`✅ Generated embedding for: ${title}`)
      } catch (error) {
        console.error(`Failed to generate embedding for ${title}:`, error)
        // Continue without embedding - not critical for import
      }
    }

    // 5. Create Project
    const { data: newProject, error: insertError } = await supabaseAdmin
      .from('projects')
      .insert({
        project_title: title,
        project_description: description || null,
        project_summary: projectSummary || null,
        description_embedding: descriptionEmbedding,
        client_name: company,
        submitted_by: submittedBy || null,
        ticket_status: ticketStatus || 'closed',
        created_at: createdDate ? new Date(createdDate).toISOString() : new Date().toISOString(),
        closed_date: closedDate ? new Date(closedDate).toISOString() : null,
        vendor_id: vendor.vendor_id,
      })
      .select()
      .single()

    if (insertError || !newProject) {
      console.error('Error inserting project:', insertError)
      projectResults.push({
        title,
        company,
        status: 'error',
        reason: insertError?.message || 'Insert failed',
        vendor_name: assignee
      })
      continue
    }

    importedCount++
    
    // 6. Assign reviewer immediately (if matched earlier)
    let reviewerAssigned = false
    let reviewerName = null
    
    if (matchedReviewer) {
      // Create review assignment
      const { error: assignError } = await supabaseAdmin
        .from('review_assignments')
        .insert({
          project_id: newProject.project_id,
          reviewer_id: matchedReviewer.user_id,
          assigned_by: null, // System-assigned
          status: 'pending',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
      
      if (!assignError) {
        reviewerAssigned = true
        reviewerName = matchedReviewer.full_name || matchedReviewer.email
        reviewersAutoAssigned++
        
        // Create notification for reviewer
        await supabaseAdmin.from('notifications').insert({
          user_id: matchedReviewer.user_id,
          notification_type: 'review_assigned',
          title: 'New Review Assignment',
          message: `You have been assigned to review: ${title}`,
          link_url: `/projects/${newProject.project_id}`,
          is_read: false
        })
      }
    }
    
    // Track success with details
    const projectResult: any = {
      title,
      company,
      status: 'imported',
      vendor_name: assignee,
      vendor_matched: true,
      ai_summary_generated: !!projectSummary,
      project_id: newProject.project_id,
      reviewer_assigned: reviewerAssigned,
      reviewer_name: reviewerName,
      submitted_by: submittedBy,
      note: reviewerAssigned 
        ? `Auto-assigned to ${reviewerName}`
        : submittedBy 
          ? `Submitted by "${submittedBy}" - no matching user found`
          : 'Ready for manual reviewer assignment'
    }
    
    projectResults.push(projectResult)
  }

  return NextResponse.json({
    success: true,
    imported: importedCount,
    skipped_duplicates: skippedDuplicates,
    skipped_unknown_vendors: skippedUnknownVendors,
    ai_summaries_generated: summariesGenerated,
    reviewers_auto_assigned: reviewersAutoAssigned,
    note: reviewersAutoAssigned > 0 
      ? `Projects imported. ${reviewersAutoAssigned} reviewer(s) auto-assigned by name match.`
      : 'Projects imported successfully. Reviewers can be manually assigned in Reviews tab.',
    project_details: projectResults // Per-project breakdown
  })
}
