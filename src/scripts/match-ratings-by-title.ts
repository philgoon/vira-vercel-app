import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function matchRatingsByTitle() {
  // Read the original ratings CSV
  const csvPath = path.join(process.cwd(), 'converted_data', 'ratings_converted.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const csvRatings = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  console.log(`Found ${csvRatings.length} ratings in CSV`)

  // Get all projects from database
  const { data: projects } = await supabase
    .from('projects')
    .select('project_id, project_title, client_id')

  // Get all ratings from database
  const { data: ratings } = await supabase
    .from('ratings')
    .select('*')
    .is('project_id', null)

  console.log(`Found ${ratings?.length || 0} unlinked ratings in database`)
  console.log(`Found ${projects?.length || 0} projects in database`)

  // Create project title map
  const projectMap = new Map()
  projects?.forEach(p => {
    const normalizedTitle = p.project_title.toLowerCase().trim()
    projectMap.set(normalizedTitle, p)
  })

  let matched = 0
  let unmatched = 0

  // Match ratings to projects using CSV data
  for (let i = 0; i < csvRatings.length && i < (ratings?.length || 0); i++) {
    const csvRating = csvRatings[i]
    const dbRating = ratings![i]
    
    const projectTitle = csvRating.project_name?.toLowerCase().trim()
    
    if (projectTitle && projectMap.has(projectTitle)) {
      const project = projectMap.get(projectTitle)
      
      // Update the rating with project_id
      const { error } = await supabase
        .from('ratings')
        .update({ 
          project_id: project.project_id,
          client_id: project.client_id 
        })
        .eq('rating_id', dbRating.rating_id)

      if (!error) {
        matched++
        console.log(`Matched rating ${dbRating.rating_id} to project "${project.project_title}"`)
      } else {
        console.error(`Error updating rating ${dbRating.rating_id}:`, error)
      }
    } else {
      unmatched++
      console.log(`No match for project "${csvRating.project_name}"`)
    }
  }

  console.log(`\nResults:`)
  console.log(`- Matched: ${matched} ratings`)
  console.log(`- Unmatched: ${unmatched} ratings`)
}

// Run the matching
matchRatingsByTitle().catch(console.error)