import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    // Get all ratings without project_id
    const { data: orphanedRatings, error: ratingsError } = await supabase
      .from('ratings')
      .select('*')
      .is('project_id', null)

    if (ratingsError) {
      return NextResponse.json({ error: ratingsError.message })
    }

    // Get all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('project_id, project_title, client_id, assigned_vendor_id')

    if (projectsError) {
      return NextResponse.json({ error: projectsError.message })
    }

    // Get all vendors for matching
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('vendor_id, vendor_name')

    if (vendorsError) {
      return NextResponse.json({ error: vendorsError.message })
    }

    // Create vendor name to ID map
    const vendorMap = new Map(vendors?.map(v => [v.vendor_name.toLowerCase(), v.vendor_id]) || [])
    
    let linkedCount = 0
    let unlinkedCount = 0
    const linkingDetails: any[] = []

    // For each orphaned rating, try to find matching project
    for (const rating of orphanedRatings || []) {
      // Try to match by vendor_id
      const matchingProjects = projects?.filter(p => 
        p.assigned_vendor_id === rating.vendor_id
      ) || []

      if (matchingProjects.length === 1) {
        // Perfect match - only one project for this vendor
        const project = matchingProjects[0]
        
        const { error: updateError } = await supabase
          .from('ratings')
          .update({ 
            project_id: project.project_id,
            client_id: project.client_id 
          })
          .eq('rating_id', rating.rating_id)

        if (!updateError) {
          linkedCount++
          linkingDetails.push({
            rating_id: rating.rating_id,
            linked_to: project.project_title,
            project_id: project.project_id
          })
        }
      } else {
        unlinkedCount++
        linkingDetails.push({
          rating_id: rating.rating_id,
          vendor_id: rating.vendor_id,
          status: 'Could not find unique project match',
          possibleMatches: matchingProjects.length
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Linked ${linkedCount} ratings to projects`,
      linkedCount,
      unlinkedCount,
      totalProcessed: orphanedRatings?.length || 0,
      linkingDetails: linkingDetails.slice(0, 20) // Show first 20 for review
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}