import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from 'src/lib/supabase';

const resolveApiBaseUrl = () => {
  const raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return String(raw).replace(/\/+$/, '').replace(/\/api$/, '');
};

const API_BASE_URL = resolveApiBaseUrl();

type Membership = {
  org_id: string;
  role: 'employer' | 'employee' | 'investor';
  org_name: string;
};

type MeResponse = {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    jobTitle: string | null;
    onboardingCompleted: boolean;
    globalRole: 'admin' | null;
    defaultOrgId: string | null;
    isActive: boolean;
    avatarStoragePath: string | null;
    avatarUrl: string | null;
  };
  activeOrg: {
    orgId: string | null;
    orgName: string | null;
    orgRole: 'employer' | 'employee' | 'investor' | null;
  };
  memberships: Membership[];
  permissions: {
    canManageRoles: boolean;
    canManageAssignments: boolean;
    canArchiveCustomer: boolean;
    canCreateCustomer: boolean;
    readOnly: boolean;
  };
};

type OAuthProvider = 'google' | 'facebook';
type SignUpResult = {
  email: string;
  needsEmailVerification: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: MeResponse | null;
  loading: boolean;
  profileLoading: boolean;
  activeOrgId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<SignUpResult>;
  signInWithProvider: (provider: OAuthProvider) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setActiveOrgId: (orgId: string | null) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const resolveFrontendBaseUrl = () => {
  if (import.meta.env.VITE_APP_URL) {
    return String(import.meta.env.VITE_APP_URL).replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/+$/, '');
  }
  return 'http://localhost:5173';
};

const buildAuthRedirectUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${resolveFrontendBaseUrl()}${normalizedPath}`;
};

const fetchMe = async (accessToken: string, orgId: string | null): Promise<MeResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(orgId ? { 'x-org-id': orgId } : {}),
    },
  });

  const payload = await response.json();

  if (!response.ok || !payload.success) {
    const details = payload.error ? ` (${payload.error})` : '';
    const error = new Error((payload.message || 'Failed to load user profile') + details) as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }

  return payload.data as MeResponse;
};

const isUnauthorizedError = (error: unknown) => {
  return Boolean(error && typeof error === 'object' && (error as { status?: number }).status === 401);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(() =>
    localStorage.getItem('crm_active_org_id'),
  );

  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession();
    let currentSession = data.session;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiresAt = currentSession?.expires_at || 0;

    if (currentSession && expiresAt > 0 && expiresAt <= nowInSeconds + 30) {
      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshed.session) {
        return null;
      }
      currentSession = refreshed.session;
      setSession(refreshed.session);
      setUser(refreshed.session.user);
    }

    return currentSession?.access_token || null;
  };

  const refreshProfile = async () => {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      setProfile(null);
      return;
    }

    setProfileLoading(true);
    try {
      const me = await fetchMe(accessToken, activeOrgId);
      setProfile(me);

      if (!activeOrgId && me.activeOrg.orgId) {
        setActiveOrgIdState(me.activeOrg.orgId);
      }
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        setActiveOrgIdState(null);
        return;
      }
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<SignUpResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: buildAuthRedirectUrl('/auth/login'),
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      email,
      needsEmailVerification: !data.session,
    };
  };

  const signInWithProvider = async (provider: OAuthProvider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: buildAuthRedirectUrl('/auth/login'),
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const requestPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: buildAuthRedirectUrl('/auth/reset-password'),
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setActiveOrgIdState(null);
      localStorage.removeItem('crm_active_org_id');
    }
  };

  const setActiveOrgId = async (orgId: string | null) => {
    setActiveOrgIdState(orgId);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setProfileLoading(true);
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);

        if (data.session?.access_token) {
          try {
            const me = await fetchMe(data.session.access_token, activeOrgId);
            setProfile(me);
            setActiveOrgIdState(me.activeOrg.orgId || null);
          } catch (error) {
            if (isUnauthorizedError(error)) {
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              setProfile(null);
              setActiveOrgIdState(null);
            } else {
              setProfile(null);
            }
          }
        }
      } finally {
        setProfileLoading(false);
        setLoading(false);
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);

      if (!newSession) {
        setProfile(null);
        setActiveOrgIdState(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      try {
        const me = await fetchMe(newSession.access_token, activeOrgId);
        setProfile(me);
        setActiveOrgIdState(me.activeOrg.orgId || null);
      } catch (error) {
        if (isUnauthorizedError(error)) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setProfile(null);
          setActiveOrgIdState(null);
        } else {
          setProfile(null);
        }
      } finally {
        setProfileLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    refreshProfile().catch(() => {
      setProfile(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrgId]);

  useEffect(() => {
    if (activeOrgId) {
      localStorage.setItem('crm_active_org_id', activeOrgId);
    } else {
      localStorage.removeItem('crm_active_org_id');
    }
  }, [activeOrgId]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      loading,
      profileLoading,
      activeOrgId,
      signIn,
      signUp,
      signInWithProvider,
      requestPasswordReset,
      updatePassword,
      signOut,
      refreshProfile,
      setActiveOrgId,
      getAccessToken,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, user, profile, loading, profileLoading, activeOrgId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
