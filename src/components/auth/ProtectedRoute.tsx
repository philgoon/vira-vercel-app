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
  allowedRoles?: UserRole[]; // If not specified, any authenticated user can access
  redirectTo?: string; // Where to redirect if not authorized (default: /login)
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, profile, profileLoading, isLoading, isAdmin, isTeam, isVendor } = useViRAAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Not signed in at all
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Profile still loading in background, don't redirect yet
    if (!profile && profileLoading) return;

    // Profile loaded but null (no DB record for this user)
    if (!profile) {
      console.error('User authenticated but no profile found');
      router.push('/login');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(profile.role)) {
      router.push('/unauthorized');
      return;
    }

    if (!profile.is_active) {
      router.push('/account-inactive');
      return;
    }
  }, [user, profile, profileLoading, isLoading, allowedRoles, redirectTo, router]);

  // Show loading state while checking auth or waiting for profile
  if (isLoading || (!profile && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  // Check role access
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return null;
  }

  // Check active status
  if (!profile.is_active) {
    return null;
  }

  // All checks passed - render children
  return <>{children}</>;
}
