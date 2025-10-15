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

  // Fetch user profile from user_profiles table
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id).then((profileData) => {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            profile: profileData,
          });
          setProfile(profileData);
          updateLastLogin(session.user.id);
        });
      }
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
