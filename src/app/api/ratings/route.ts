// [R4.4] Updated vendor ratings API route using actual Supabase schema
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');

    let query = supabase
      .from('ratings')
      .select(`
        *,
        vendors:vendor_id(vendor_name, service_categories),
        projects:project_id(project_title),
        clients:client_id(client_name)
      `)
      .order('rating_date', { ascending: false });

    // Filter by vendor if provided
    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    const { data: ratings, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
    }

    return NextResponse.json({ ratings });
  } catch (error) {
    console.error('Failed to fetch ratings:', error);
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
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
