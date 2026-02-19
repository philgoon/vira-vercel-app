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

// [an8.11] Read role from Clerk publicMetadata (JWT), DB fallback if missing
export async function requireAuth(
  requiredRole?: UserRole | UserRole[]
): Promise<AuthResult | NextResponse> {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fast path: role cached in Clerk session claims
  const meta = sessionClaims?.publicMetadata as { role?: string; profileId?: string } | undefined
  if (meta?.role && meta?.profileId) {
    const role = meta.role as UserRole
    if (requiredRole) {
      const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      if (!allowed.includes(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
    return { userId, role, profileId: meta.profileId }
  }

  // Slow path: DB lookup (users without metadata synced yet)
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
