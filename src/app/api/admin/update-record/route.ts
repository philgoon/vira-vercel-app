import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// [R1] Admin API for updating database records with full CRUD capabilities
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('=== UPDATE RECORD DEBUG ===');
    console.log('Request body:', JSON.stringify(body, null, 2));

    // [R1]: Support both single-field updates (inline editing) and full-object updates (modal editing)
    const { table, id, field, value, data } = body;

    // Single field update (from inline editing)
    if (field && value !== undefined) {
      return handleSingleFieldUpdate(table, id, field, value);
    }

    // Full object update (from modal editing)
    if (!table || !id || !data) {
      console.log('Missing parameters:', { table: !!table, id: !!id, data: !!data });
      return NextResponse.json({
        error: 'Table, ID, and data parameters required',
        received: { table: !!table, id: !!id, data: !!data }
      }, { status: 400 });
    }

    let query;
    const updateData = { ...data };

    // Remove read-only fields that shouldn't be updated
    delete updateData.created_at;
    delete updateData.updated_at;
    delete updateData.created_date; // Handle both timestamp formats
    delete updateData.updated_date;

    // Add updated timestamp based on table schema
    // All tables use created_at/updated_at format per schema
    updateData.updated_at = new Date().toISOString();

    switch (table) {
      case 'vendors':
        // [R2]: Use base tables to match table-data API alignment
        delete updateData.total_projects; // Remove calculated fields
        delete updateData.avg_overall_rating; // Remove calculated fields
        delete updateData.vendor_id; // Don't update primary key

        console.log('Updating vendor with data:', updateData);
        query = supabase
          .from('vendors')
          .update(updateData)
          .eq('vendor_id', id)
          .select();
        break;

      case 'projects':
        delete updateData.project_id; // Don't update primary key

        console.log('Updating project with data:', updateData);
        query = supabase
          .from('projects')
          .update(updateData)
          .eq('project_id', id)
          .select();
        break;

      default:
        return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const { data: updatedData, error } = await query;

    if (error) {
      console.error('Database update error:', error);
      console.error('Update data that failed:', updateData);
      return NextResponse.json({
        error: 'Database update failed',
        details: error.message,
        table,
        id,
        updateData
      }, { status: 500 });
    }

    console.log('Successfully updated:', table, id);

    return NextResponse.json({
      success: true,
      data: updatedData?.[0] || null,
      message: `${table} record updated successfully`
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// [R3]: Handle single field updates for inline editing
async function handleSingleFieldUpdate(table: string, id: string, field: string, value: string) {
  try {
    const updateData = {
      [field]: value,
      updated_at: new Date().toISOString()
    };

    let query;
    switch (table) {
      case 'vendors':
        query = supabase
          .from('vendors')
          .update(updateData)
          .eq('vendor_id', id)
          .select();
        break;

      case 'projects':
        query = supabase
          .from('projects')
          .update(updateData)
          .eq('project_id', id)
          .select();
        break;

      default:
        return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const { data: updatedData, error } = await query;

    if (error) {
      console.error('Single field update error:', error);
      return NextResponse.json({
        error: 'Database update failed',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedData?.[0] || null,
      message: `${table} ${field} updated successfully`
    });

  } catch (error) {
    console.error('Single field update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
