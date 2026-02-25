// [R-FOUNDATION] Sprint 2: Protected Route Component
// Purpose: Wraps components that require authentication and/or specific roles
// Redirects to login if not authenticated or shows access denied if wrong role

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useViRAAuth } from '@/hooks/useViRAAuth';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, profile, profileLoading, isLoading } = useViRAAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push(redirectTo); return; }
    if (!profile && profileLoading) return;
    if (!profile) { router.push('/unauthorized'); return; }
    if (allowedRoles && !allowedRoles.includes(profile.role)) { router.push('/unauthorized'); return; }
    if (!profile.is_active) { router.push('/account-inactive'); return; }
  }, [user, profile, profileLoading, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading || (!profile && profileLoading)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="stm-loader stm-loader-lg" style={{ justifyContent: 'center', marginBottom: 'var(--stm-space-4)' }}>
            <span className="stm-loader-capsule stm-loader-dot" />
            <span className="stm-loader-capsule stm-loader-dot" />
            <span className="stm-loader-capsule stm-loader-dot" />
            <span className="stm-loader-capsule stm-loader-dash" />
            <span className="stm-loader-capsule stm-loader-dash" />
            <span className="stm-loader-capsule stm-loader-dash" />
          </div>
          <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;
  if (allowedRoles && !allowedRoles.includes(profile.role)) return null;
  if (!profile.is_active) return null;

  return <>{children}</>;
}
