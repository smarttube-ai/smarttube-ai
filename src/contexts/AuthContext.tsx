import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  initialized: boolean;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isAdmin: () => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  initialized: false,
  signOut: async () => {},
  isLoading: false,
  isAdmin: () => false,
  refreshProfile: async () => {},
});

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'hello.smarttubeai@gmail.com,mbasam313@gmail.com')
  .split(',')
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean);

const isPrivilegedAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check for cached profile in sessionStorage
  const getCachedProfile = (userId: string): Profile | null => {
    try {
      const cachedProfileData = sessionStorage.getItem(`profile_${userId}`);
      if (cachedProfileData) {
        return JSON.parse(cachedProfileData);
      }
    } catch (error) {
      console.error('Error getting cached profile:', error);
    }
    return null;
  };

  // Cache profile data in sessionStorage
  const cacheProfile = (userId: string, profileData: Profile) => {
    try {
      sessionStorage.setItem(`profile_${userId}`, JSON.stringify(profileData));
    } catch (error) {
      console.error('Error caching profile:', error);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      // Check for cached profile first
      const cachedProfile = getCachedProfile(userId);
      if (cachedProfile) {
        console.log('Using cached profile data');
        setProfile(cachedProfile);
      }

      // Always fetch fresh data from database
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, created_at, updated_at, role')
        .eq('id', userId)
        .single();

      // Get user email
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData?.user?.email;
      const shouldBeAdmin = isPrivilegedAdminEmail(userEmail);
      
      // Set profile
      if (error) {
        console.error('Error fetching profile:', error);
        // If no profile but this user is in admin allow-list, create profile as admin.
        if (shouldBeAdmin) {
          const tempProfile = {
            id: userId,
            email: userEmail,
            role: 'admin',
            full_name: null,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setProfile(tempProfile);
          cacheProfile(userId, tempProfile);
          
          // Also insert this profile into the database
          try {
            await supabase.from('profiles').upsert({
              id: userId,
              email: userEmail,
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          } catch (insertError) {
            console.error('Error inserting profile:', insertError);
          }
        } else {
          // Auto-heal missing profile rows for normal users as well.
          try {
            const baseProfile = {
              id: userId,
              email: userEmail || '',
              role: 'user',
              full_name: null,
              avatar_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            await supabase.from('profiles').upsert(baseProfile);
            setProfile(baseProfile);
            cacheProfile(userId, baseProfile);
          } catch (upsertError) {
            console.error('Error creating missing profile:', upsertError);
            setProfile(null);
          }
        }
      } else {
        // We have a profile - ensure allowed admin emails always keep admin role.
        if (shouldBeAdmin && data.role !== 'admin') {
          const updatedProfile = { ...data, role: 'admin' };
          setProfile(updatedProfile);
          cacheProfile(userId, updatedProfile);
          
          // Update the role in the database
          try {
            await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
          } catch (updateError) {
            console.error('Error updating role:', updateError);
          }
        } else {
          setProfile(data);
          cacheProfile(userId, data);
        }
      }
      
    } catch (error) {
      console.error('Error in profile handling:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error handling auth change:', error);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear all local storage and session data immediately
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear React state
      setUser(null);
      setProfile(null);
      
      // Force immediate redirect
      window.location.replace('/');
      
      // Cleanup Supabase session in background
      supabase.auth.signOut().catch(console.error);
      
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, profile, initialized, signOut, isLoading, isAdmin, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}