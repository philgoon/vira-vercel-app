// [R-FOUNDATION] Sprint 2: Protected Route Component
// Purpose: Wraps components that require authentication and/or specific roles
// Redirects to login if not authenticated or shows access denied if wrong role

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if we're in skip auth mode
    const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';

    if (!isLoading) {
      // In skip auth mode, allow all access
      if (skipAuth) {
        return;
      }

      // Not authenticated - redirect to login
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Authenticated but no profile - shouldn't happen, but handle gracefully
      if (!profile) {
        console.error('User authenticated but no profile found');
        router.push('/error');
        return;
      }

      // Check role-based access if allowedRoles specified
      if (allowedRoles && !allowedRoles.includes(profile.role)) {
        console.warn(`Access denied: User role ${profile.role} not in allowed roles`);
        router.push('/unauthorized');
        return;
      }

      // Check if user is active
      if (!profile.is_active) {
        console.warn('User account is inactive');
        router.push('/account-inactive');
        return;
      }
    }
  }, [user, profile, isLoading, allowedRoles, redirectTo, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if we're in skip auth mode
  const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';

  // In skip auth mode, render children immediately
  if (skipAuth) {
    return <>{children}</>;
  }

  // Don't render children until auth check complete
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
