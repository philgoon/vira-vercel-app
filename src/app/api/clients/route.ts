import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// [R3] Clients API endpoint using clients_summary view for performance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = supabase
      .from('clients_summary')
      .select('*');

    // [R3.1] Optional search filtering
    if (search) {
      query = query.ilike('client_name', `%${search}%`);
    }

    const { data, error } = await query.order('client_name');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch clients', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
