// [R-FOUNDATION] Sprint 2: Authentication Utilities
// Purpose: Helper functions for authentication and authorization checks

import { UserProfile, UserRole } from '@/types';

/**
 * Check if user has required role
 */
export function hasRole(profile: UserProfile | null, role: UserRole): boolean {
  return profile?.role === role && profile?.is_active === true;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(profile: UserProfile | null, roles: UserRole[]): boolean {
  return profile?.is_active === true && roles.includes(profile.role);
}

/**
 * Check if user is admin
 */
export function isAdmin(profile: UserProfile | null): boolean {
  return hasRole(profile, 'admin');
}

/**
 * Check if user is team member
 */
export function isTeam(profile: UserProfile | null): boolean {
  return hasRole(profile, 'team');
}

/**
 * Check if user is vendor
 */
export function isVendor(profile: UserProfile | null): boolean {
  return hasRole(profile, 'vendor');
}

/**
 * Check if user can manage users (admin only)
 */
export function canManageUsers(profile: UserProfile | null): boolean {
  return isAdmin(profile);
}

/**
 * Check if user can rate projects (admin or team)
 */
export function canRateProjects(profile: UserProfile | null): boolean {
  return hasAnyRole(profile, ['admin', 'team']);
}

/**
 * Check if user can view vendor ratings (admin or team)
 */
export function canViewAllRatings(profile: UserProfile | null): boolean {
  return hasAnyRole(profile, ['admin', 'team']);
}

/**
 * Check if user can view specific vendor's ratings
 * Vendors can only see their own ratings
 */
export function canViewVendorRatings(
  profile: UserProfile | null,
  vendorId: string
): boolean {
  if (!profile) return false;
  
  // Admin and team can view all vendor ratings
  if (hasAnyRole(profile, ['admin', 'team'])) {
    return true;
  }
  
  // Vendors can only view their own ratings
  if (isVendor(profile) && profile.vendor_id === vendorId) {
    return true;
  }
  
  return false;
}

/**
 * Get user display name
 */
export function getUserDisplayName(profile: UserProfile | null): string {
  if (!profile) return 'Guest';
  return profile.full_name || profile.email;
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    team: 'Team Member',
    vendor: 'Vendor',
  };
  return roleNames[role];
}

/**
 * Get role badge color for UI
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-800',
    team: 'bg-blue-100 text-blue-800',
    vendor: 'bg-green-100 text-green-800',
  };
  return colors[role];
}
