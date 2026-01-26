import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile, Organization } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  organization: Organization | null;
  loading: boolean;
  organizationLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshOrganization: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizationLoading, setOrganizationLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!error && data) {
      setProfile(data);
    }
    return data;
  };

  const fetchOrganization = async (userId: string) => {
    setOrganizationLoading(true);
    try {
      // First try to find organization where user is owner
      const { data: ownedOrg } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle();

      if (ownedOrg) {
        setOrganization(ownedOrg);
        return ownedOrg;
      }

      // Then try to find organization where user is a member
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (membership) {
        const { data: org } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', membership.organization_id)
          .single();
        
        if (org) {
          setOrganization(org);
          return org;
        }
      }

      setOrganization(null);
      return null;
    } finally {
      setOrganizationLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const refreshOrganization = async () => {
    if (user) {
      await fetchOrganization(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setOrganization(null);
  };

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      try {
        // Set up auth state listener FIRST
        const { data } = supabase.auth.onAuthStateChange(
          (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            
            // Defer Supabase calls with setTimeout
            if (session?.user) {
              setTimeout(() => {
                fetchProfile(session.user.id);
                fetchOrganization(session.user.id);
              }, 0);
            } else {
              setProfile(null);
              setOrganization(null);
              setOrganizationLoading(false);
            }
            setLoading(false);
          }
        );
        subscription = data.subscription;

        // THEN check for existing session
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
        setUser(sessionData.session?.user ?? null);
        
        if (sessionData.session?.user) {
          fetchProfile(sessionData.session.user.id);
          fetchOrganization(sessionData.session.user.id);
        }
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
        setOrganizationLoading(false);
      }
    };

    initAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      organization,
      loading,
      organizationLoading,
      signOut,
      refreshProfile,
      refreshOrganization,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
