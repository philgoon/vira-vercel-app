import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { requireAuth, isNextResponse } from '@/lib/clerk-auth'

export async function GET() {
  const authResult = await requireAuth('admin');
  if (isNextResponse(authResult)) return authResult;

  const { data, error } = await supabaseAdmin
    .from('vendors')
    .select('vendor_code')
    .order('vendor_code', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // If no vendors exist yet, start at VEN-001
    if (error.code === 'PGRST116') {
      return NextResponse.json({ nextVendorCode: 'VEN-001' })
    }
    console.error('Supabase error:', error)
    return NextResponse.json({ error: 'Failed to get next vendor code' }, { status: 500 })
  }

  const lastCode = data.vendor_code || 'VEN-000'
  const lastNumber = parseInt(lastCode.split('-')[1])
  const nextNumber = lastNumber + 1
  const nextVendorCode = `VEN-${String(nextNumber).padStart(3, '0')}`

  return NextResponse.json({ nextVendorCode })
}
