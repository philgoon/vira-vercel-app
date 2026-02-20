import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, isNextResponse } from '@/lib/clerk-auth';

// [R1] Admin API for fetching table data with full database visibility
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    // [an8.15] Pagination: default 100 rows, supports ?page= and ?limit=
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '100', 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    if (!table) {
      return NextResponse.json({ error: 'Table parameter required' }, { status: 400 });
    }

    let query;

    switch (table) {
      case 'vendors':
        query = supabase
          .from('vendors')
          .select('*', { count: 'exact' });
        break;

      case 'projects':
        query = supabase
          .from('projects')
          .select('*', { count: 'exact' });
        break;

      case 'user_profiles':
        query = supabase
          .from('user_profiles')
          .select('*', { count: 'exact' });
        break;

      case 'ratings':
        query = supabase
          .from('projects_consolidated')
          .select('*', { count: 'exact' })
          .not('project_success', 'is', null);
        break;

      default:
        return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      total: count ?? data?.length ?? 0,
      page,
      limit,
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
