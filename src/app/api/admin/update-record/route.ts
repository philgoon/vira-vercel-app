import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, isNextResponse } from '@/lib/clerk-auth';

// [R1] Admin API for updating database records with full CRUD capabilities
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// [an8.5] Field allowlists prevent arbitrary column writes
const ALLOWED_FIELDS: Record<string, Set<string>> = {
  vendors: new Set([
    'vendor_name', 'vendor_type', 'service_categories', 'skills',
    'pricing_structure', 'rate_cost', 'status', 'website', 'email',
    'phone', 'primary_contact', 'industry', 'availability',
    'availability_status', 'available_from', 'availability_notes',
    'portfolio_url', 'sample_work_urls', 'notes',
  ]),
  projects: new Set([
    'project_title', 'project_description', 'project_type', 'status',
    'client_name', 'client_id', 'vendor_id', 'vendor_name',
    'contact_date', 'expected_deadline', 'project_success_rating',
    'quality_rating', 'communication_rating', 'what_went_well',
    'areas_for_improvement', 'recommend_again', 'timeline_status',
    'project_overall_rating_input', 'project_overall_rating_calc',
    'rating_status', 'submitted_by', 'rating_date',
  ]),
};

export async function POST(request: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  try {
    const body = await request.json();
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

    // [an8.5] Strip to allowed fields only
    const allowedSet = ALLOWED_FIELDS[table];
    if (!allowedSet) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }
    const updateData: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data)) {
      if (allowedSet.has(key)) updateData[key] = val;
    }
    updateData.updated_at = new Date().toISOString();

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
      console.error('Database update error:', error);
      return NextResponse.json({
        error: 'Database update failed',
        details: error.message,
      }, { status: 500 });
    }

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
    // [an8.5] Validate field against allowlist
    const allowedSet = ALLOWED_FIELDS[table];
    if (!allowedSet?.has(field)) {
      return NextResponse.json({ error: `Field '${field}' not allowed for ${table}` }, { status: 400 });
    }

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
