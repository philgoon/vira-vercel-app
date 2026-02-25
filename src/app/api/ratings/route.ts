// [R4.4] Ratings API - Projects needing rating review using new schema
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isNextResponse } from '@/lib/clerk-auth';

export async function GET() {
  const authResult = await requireAuth();
  if (isNextResponse(authResult)) return authResult;
  try {
    // Fetch projects from view that already includes rating_status
    const { data: projects, error: projectsError } = await supabaseAdmin
      .from('projects_with_vendor')
      .select('*')
      .or('rating_status.eq.Needs Review,rating_status.eq.Incomplete,rating_status.eq.Complete');

    if (projectsError) {
      console.error('❌ Supabase error fetching projects needing ratings:', projectsError);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    console.log(`✅ Ratings API: ${projects?.length || 0} projects needing rating work`);

    return NextResponse.json(projects || []);
  } catch (error) {
    console.error('Failed to fetch projects needing ratings:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(['admin', 'team']);
  if (isNextResponse(authResult)) return authResult;
  try {
    const body = await request.json();
    const { project_id, ...ratingData } = body;

    // Validate required project_id
    if (!project_id) {
      return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
    }

    // Compute overall if all 3 dimensions are present (triggers assignment auto-complete)
    const { project_success_rating, quality_rating, communication_rating } = ratingData;
    if (project_success_rating && quality_rating && communication_rating) {
      ratingData.project_overall_rating_calc =
        (project_success_rating + quality_rating + communication_rating) / 3;
    }

    // Update the projects table directly (view will auto-update)
    const { data: updatedProject, error } = await supabaseAdmin
      .from('projects')
      .update(ratingData)
      .eq('project_id', project_id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error updating project rating:', error);
      return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 });
    }

    console.log('✅ Project rating updated:', { project_id, ratingData });

    return NextResponse.json({ project: updatedProject }, { status: 200 });
  } catch (error) {
    console.error('Failed to update project rating:', error);
    return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 });
  }
}
