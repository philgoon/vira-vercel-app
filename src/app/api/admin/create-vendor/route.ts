import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const vendor = await req.json()

  const { data, error } = await supabaseAdmin
    .from('vendors')
    .insert(vendor)
    .select()
    .single()

  if (error) {
    console.error('Supabase insert error:', error)
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 })
  }

  return NextResponse.json(data)
}
