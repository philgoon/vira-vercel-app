// [R8.1] Simplified ratings API route using new 2-table schema
// Replaces expensive 2-query + client-side joins with single query
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Single query replaces the previous 2 queries + JavaScript joins
    const { data: projects, error } = await supabase
      .from('projects_consolidated')
      .select(`
        project_id,
        project_name,
        client_name,
        vendor_name,
        project_type,
        project_value,
        start_date,
        end_date,
        project_status,
        success_rating,
        quality_rating,
        communication_rating,
        overall_rating,
        rating_status,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Insert into consolidated table - triggers will auto-calculate overall_rating
    const { data: project, error } = await supabase
      .from('projects_consolidated')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Failed to create rating:', error);
    return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 });
  }
}
