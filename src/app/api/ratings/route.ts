// [R4.4] Updated vendor ratings API route using actual Supabase schema
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Fetch all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        *,
        vendors:assigned_vendor_id (
          vendor_id,
          vendor_name,
          service_categories
        )
      `);

    if (projectsError) {
      console.error('Supabase error fetching projects:', projectsError);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    // 2. Fetch all ratings
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select('*');

    console.log('🔍 [DEBUG] Ratings query result:', {
      success: !ratingsError,
      ratingCount: ratings?.length || 0,
      error: ratingsError
    });

    if (ratingsError) {
      console.error('❌ Supabase error fetching ratings:', ratingsError);
      return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
    }

    // 3. Join projects and ratings
    const combinedData = projects.map(project => {
      const rating = ratings.find(r => r.project_id === project.project_id);
      return {
        ...project,
        rating: rating || null
      };
    });

    // 4. Add rating status
    const dataWithStatus = combinedData.map(item => {
      const rating = item.rating;
      const isComplete = rating ? rating.project_success_rating && rating.vendor_quality_rating && rating.vendor_communication_rating : false;
      return {
        ...item,
        rating_status: rating ? (isComplete ? 'Complete' : 'Incomplete') : 'Needs Review'
      };
    });

    return NextResponse.json({ projects: dataWithStatus });
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data: rating, error } = await supabase
      .from('ratings')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 });
    }

    return NextResponse.json({ rating }, { status: 201 });
  } catch (error) {
    console.error('Failed to create rating:', error);
    return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 });
  }
}
