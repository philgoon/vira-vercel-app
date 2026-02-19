import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isNextResponse } from '@/lib/clerk-auth'

export async function POST(req: NextRequest) {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  const { table, id } = await req.json()

  if (!table || !id) {
    return NextResponse.json({ error: 'Table and ID are required' }, { status: 400 })
  }

  let idColumn: string;
  if (table === 'vendors') {
    idColumn = 'vendor_id';
  } else if (table === 'projects') {
    idColumn = 'project_id';
  } else {
    return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from(table)
    .delete()
    .eq(idColumn, id)

  if (error) {
    console.error('Supabase delete error:', error)
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Record deleted successfully' })
}
