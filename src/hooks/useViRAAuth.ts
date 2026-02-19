// [R-CLERK-4]: ViRA auth hook - Clerk identity + user_profiles role
// [an8.12] Reads role from Clerk publicMetadata first (no API roundtrip to unblock UI)
'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/types';

export function useViRAAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // [an8.12] Role available from Clerk JWT metadata instantly
  const metaRole = user?.publicMetadata?.role as string | undefined;

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    // If metadata has role, stop blocking the UI immediately.
    // Full profile still loads in background for other fields.
    if (metaRole) {
      setProfileLoading(false);
    }

    fetch(`/api/users/profile?clerk_user_id=${user.id}`)
      .then((r) => r.json())
      .then(async (data) => {
        if (data.profile) {
          setProfile(data.profile);
        } else {
          const bootstrap = await fetch('/api/users/profile', { method: 'POST' });
          if (bootstrap.ok) {
            const bootstrapped = await bootstrap.json();
            setProfile(bootstrapped.profile ?? null);
          } else {
            setProfile(null);
          }
        }
      })
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, [isLoaded, isSignedIn, user?.id]);

  const signOut = async () => {
    await clerkSignOut();
    setProfile(null);
  };

  // Role from full profile (ground truth) or metadata (fast path)
  const role = profile?.role || metaRole;

  return {
    user,
    profile,
    profileLoading,
    isLoading: !isLoaded || (!metaRole && profileLoading),
    isAdmin: role === 'admin',
    isTeam: role === 'team',
    isVendor: role === 'vendor',
    signOut,
  };
}
