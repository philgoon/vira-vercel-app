// [R-CLERK-7]: Server-side auth helpers for API routes
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export type UserRole = 'admin' | 'team' | 'vendor'

interface AuthResult {
  userId: string
  role: UserRole
  profileId: string
}

/**
 * Verify Clerk session and look up user_profiles role.
 * Returns 401/403 NextResponse on failure, or AuthResult on success.
 */
export async function requireAuth(
  requiredRole?: UserRole | UserRole[]
): Promise<AuthResult | NextResponse> {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id, role')
    .eq('clerk_user_id', userId)
    .single()

  if (error || !profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!allowed.includes(profile.role as UserRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  return { userId, role: profile.role as UserRole, profileId: profile.user_id }
}

export function isNextResponse(val: unknown): val is NextResponse {
  return val instanceof NextResponse
}
