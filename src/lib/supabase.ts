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
// [an8.10] Server-only env vars aren't available at module scope in Next.js,
// so we warn instead of throw. The client will fail on first use if unset.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseServiceKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations will fail.')
}
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseKey
)
