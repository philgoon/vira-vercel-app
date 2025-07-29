import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  // Check if ratings table exists and get structure
  const { data: ratingsData, error } = await supabase
    .from('vendor_ratings')
    .select('*')
    .limit(1)
    .single()
  
  const { count } = await supabase
    .from('vendor_ratings')
    .select('*', { count: 'exact', head: true })
  
  return NextResponse.json({
    tableExists: !error,
    error: error?.message,
    sampleRating: ratingsData,
    totalRatings: count || 0,
    ratingColumns: ratingsData ? Object.keys(ratingsData) : 'No ratings found'
  })
}