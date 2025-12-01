// [R-FOUNDATION] Sprint 2: Authentication Context
// Purpose: Provides authentication state and methods throughout the application
// Integrates with Supabase Auth and user_profiles table

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContextType, AuthUser, UserProfile } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // [R-FIX] Fetch user profile with timeout to prevent indefinite hang
  const fetchProfile = async (userId: string, timeoutMs = 10000): Promise<UserProfile | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .abortSignal(controller.signal)
        .single();

      clearTimeout(timeoutId);

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error?.name === 'AbortError') {
        console.error('Profile fetch timed out after', timeoutMs, 'ms');
      } else {
        console.error('Error in fetchProfile:', error);
      }
      return null;
    }
  };

  // Update last login timestamp
  const updateLastLogin = async (userId: string) => {
    try {
      await supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Check if we're in skip auth mode
    const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';

    if (skipAuth) {
      // In skip auth mode, set a mock admin user
      const mockProfile: UserProfile = {
        user_id: 'skip-auth-user',
        email: 'admin@skip-auth.test',
        full_name: 'Skip Auth Admin',
        role: 'admin',
        vendor_id: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      };

      setUser({
        id: 'skip-auth-user',
        email: 'admin@skip-auth.test',
        profile: mockProfile,
      });
      setProfile(mockProfile);
      setIsLoading(false);
      return;
    }

    // Normal auth flow
    // [R-FIX] Safety timeout - ensure isLoading is set to false after max 15s
    const safetyTimeout = setTimeout(() => {
      console.warn('Auth initialization timed out - forcing isLoading to false');
      setIsLoading(false);
    }, 15000);

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          profile: profileData,
        });
        setProfile(profileData);
        updateLastLogin(session.user.id);
      }
      clearTimeout(safetyTimeout);
      setIsLoading(false);
    }).catch((error) => {
      console.error('Failed to get session:', error);
      clearTimeout(safetyTimeout);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          profile: profileData,
        });
        setProfile(profileData);

        if (event === 'SIGNED_IN') {
          updateLastLogin(session.user.id);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
    setProfile(null);
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      setUser({
        ...user,
        profile: profileData,
      });
    }
  };

  // Computed role checks
  const isAdmin = profile?.role === 'admin';
  const isTeam = profile?.role === 'team';
  const isVendor = profile?.role === 'vendor';

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAdmin,
    isTeam,
    isVendor,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
