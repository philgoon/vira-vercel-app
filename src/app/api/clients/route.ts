import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, isNextResponse } from '@/lib/clerk-auth';

// [R3] Clients API endpoint using clients_summary view for performance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = supabaseAdmin
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

// [R3.2] Upsert client profile data
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  try {
    const body = await request.json();
    const { client_id, client_name, ...profileData } = body;

    if (!client_id) {
      return NextResponse.json({ error: 'client_id required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('client_profiles')
      .upsert({
        client_id,
        client_name,
        ...profileData,
      }, { onConflict: 'client_id' });

    if (error) {
      console.error('Client profile upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Client profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
