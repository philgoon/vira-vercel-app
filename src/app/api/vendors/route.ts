// [R4.1] Updated vendors API route using actual Supabase schema
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    let query = supabase
      .from('vendors')
      .select('*')
      .order('vendor_name');

    // Apply filters if provided
    if (search) {
      query = query.or(`vendor_name.ilike.%${search}%,specialties.ilike.%${search}%,service_categories.ilike.%${search}%`);
    }
    
    if (type && type !== 'all') {
      query = query.eq('service_categories', type);
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: vendors, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
    }

    return NextResponse.json({ vendors });
  } catch (error) {
    console.error('Failed to fetch vendors:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data: vendor, error } = await supabase
      .from('vendors')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
    }

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error) {
    console.error('Failed to create vendor:', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}
