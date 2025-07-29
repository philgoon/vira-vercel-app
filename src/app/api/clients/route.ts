// [R4.3] Updated clients API route using actual Supabase schema
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const id = searchParams.get('id');
    const industry = searchParams.get('industry');

    let query = supabase
      .from('clients')
      .select('*')
      .order('client_name');

    // Apply filters if provided
    if (id) {
      query = query.eq('client_id', id);
    } else {
      if (search) {
        query = query.or(`client_name.ilike.%${search}%,industry.ilike.%${search}%`);
      }
      
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      
      if (industry && industry !== 'all') {
        query = query.eq('industry', industry);
      }
    }

    const { data: clients, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }

    return NextResponse.json({ clients });
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data: client, error } = await supabase
      .from('clients')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
    }

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error('Failed to create client:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { client_id, ...updateData } = body;

    // Validate required fields
    if (!client_id) {
      return NextResponse.json(
        { error: 'Missing required field: client_id' }, 
        { status: 400 }
      );
    }

    // Update client with all provided fields
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('client_id', client_id)
      .select()
      .single();

    if (updateError) {
      console.error('Client update error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update client',
        details: updateError
      }, { status: 500 });
    }

    return NextResponse.json({ 
      client: updatedClient,
      message: 'Client updated successfully'
    });

  } catch (error) {
    console.error('Failed to update client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}
