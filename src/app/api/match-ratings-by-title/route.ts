import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    // Read the original ratings CSV
    const csvPath = path.join(process.cwd(), 'converted_data', 'ratings_converted.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const csvRatings = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    // Get all projects from database
    const { data: projects } = await supabase
      .from('projects')
      .select('project_id, project_title, client_id')

    // Get all unlinked ratings from database (skip the 1 already linked)
    const { data: ratings } = await supabase
      .from('ratings')
      .select('*')
      .is('project_id', null)
      .order('rating_id')

    // Create project title map (normalized)
    const projectMap = new Map()
    projects?.forEach(p => {
      const normalizedTitle = p.project_title.toLowerCase().trim()
      projectMap.set(normalizedTitle, p)
    })

    let matched = 0
    let unmatched = 0
    const matchDetails: any[] = []

    // Match ratings to projects using CSV data
    // Skip first row since we already linked one rating
    const startIndex = 77 - (ratings?.length || 0) // Calculate offset
    
    for (let i = 0; i < (ratings?.length || 0); i++) {
      const csvIndex = i + startIndex
      if (csvIndex >= csvRatings.length) break
      
      const csvRating = csvRatings[csvIndex]
      const dbRating = ratings![i]
      
      const projectTitle = csvRating.project_name?.toLowerCase().trim()
      
      if (projectTitle && projectMap.has(projectTitle)) {
        const project = projectMap.get(projectTitle)
        
        // Update the rating with project_id and client_id
        const { error } = await supabase
          .from('ratings')
          .update({ 
            project_id: project.project_id,
            client_id: project.client_id 
          })
          .eq('rating_id', dbRating.rating_id)

        if (!error) {
          matched++
          matchDetails.push({
            rating_id: dbRating.rating_id,
            matched_to: project.project_title,
            project_id: project.project_id
          })
        } else {
          matchDetails.push({
            rating_id: dbRating.rating_id,
            error: error.message
          })
        }
      } else {
        unmatched++
        matchDetails.push({
          rating_id: dbRating.rating_id,
          csv_project: csvRating.project_name,
          status: 'No matching project found'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Matched ${matched} ratings to projects by title`,
      matched,
      unmatched,
      totalProcessed: ratings?.length || 0,
      matchDetails: matchDetails.slice(0, 20)
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}