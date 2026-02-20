// [R2.1] Fixed Supabase client configuration for database operations
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Server-side client with service role (for admin operations)
// [an8.10] Throw at startup if missing; falling back to anon client silently bypasses RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations require this key.')
}
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
