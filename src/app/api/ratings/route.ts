// [R4.4] Ratings API - Projects needing rating review using new schema
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch projects from view that already includes rating_status
    const { data: projects, error: projectsError } = await supabase
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project_id, ...ratingData } = body;

    // Validate required project_id
    if (!project_id) {
      return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
    }

    // Update the projects table directly (view will auto-update)
    const { data: updatedProject, error } = await supabase
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
