import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    // Get all unique project IDs that have ratings
    const { data: ratingsData } = await supabase
      .from('ratings')
      .select('project_id')
      .not('project_id', 'is', null)

    if (!ratingsData || ratingsData.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No rated projects found',
        updatedCount: 0
      })
    }

    // Get unique project IDs
    const ratedProjectIds = [...new Set(ratingsData.map(r => r.project_id))]

    // Update these projects to archived status
    const { data, error } = await supabase
      .from('projects')
      .update({ status: 'archived' })
      .in('project_id', ratedProjectIds)
      .select('project_id, project_title')

    if (error) {
      return NextResponse.json({ error: error.message })
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${data?.length || 0} rated projects to archived status`,
      updatedCount: data?.length || 0,
      updatedProjects: data?.map(p => ({
        id: p.project_id,
        title: p.project_title
      }))
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}