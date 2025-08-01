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

    const { table, id, data } = body;

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
        // Ensure service_categories is properly formatted as array
        if (updateData.service_categories && typeof updateData.service_categories === 'string') {
          try {
            updateData.service_categories = JSON.parse(updateData.service_categories);
          } catch {
            // If not valid JSON, split by comma and clean up
            updateData.service_categories = updateData.service_categories
              .split(',')
              .map((cat: string) => cat.trim())
              .filter((cat: string) => cat.length > 0);
          }
        }

        console.log('Updating vendor with data:', updateData);
        query = supabase
          .from('vendors')
          .update(updateData)
          .eq('vendor_id', id) // Use correct primary key
          .select();
        break;

      case 'clients':
        console.log('Updating client with data:', updateData);
        query = supabase
          .from('clients')
          .update(updateData)
          .eq('client_id', id) // Use correct primary key
          .select();
        break;

      case 'projects':
        // Remove relational fields
        delete updateData.client_name;

        console.log('Updating project with data:', updateData);
        query = supabase
          .from('projects')
          .update(updateData)
          .eq('project_id', id) // Use correct primary key
          .select();
        break;

      case 'ratings':
        // Remove relational fields
        delete updateData.project_name;
        delete updateData.vendor_name;

        console.log('Updating rating with data:', updateData);
        query = supabase
          .from('ratings') // Use correct table name
          .update(updateData)
          .eq('rating_id', id) // Use correct primary key
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
