// [R-CLERK-4]: ViRA auth hook - Clerk identity + user_profiles role
'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/types';

export function useViRAAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    fetch(`/api/users/profile?clerk_user_id=${user.id}`)
      .then((r) => r.json())
      .then(async (data) => {
        if (data.profile) {
          setProfile(data.profile);
        } else {
          // Attempt bootstrap (succeeds only if no profiles exist yet)
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

  return {
    user,
    profile,
    isLoading: !isLoaded || profileLoading,
    isAdmin: profile?.role === 'admin',
    isTeam: profile?.role === 'team',
    isVendor: profile?.role === 'vendor',
    signOut,
  };
}
