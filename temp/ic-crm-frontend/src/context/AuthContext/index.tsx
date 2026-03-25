import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AuthSession,
  AuthSessionUser,
  backendAuthRequest,
  clearStoredAuthSession,
  getValidStoredAccessToken,
  readStoredAuthSession,
  writeStoredAuthSession,
} from 'src/lib/backendAuth';

const resolveApiBaseUrl = () => {
  const raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return String(raw).replace(/\/+$/, '').replace(/\/api$/, '');
};

const API_BASE_URL = resolveApiBaseUrl();

const readStoredActiveOrgId = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.sessionStorage.getItem('crm_active_org_id');
};

const clearStoredActiveOrgId = () => {
  if (typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.removeItem('crm_active_org_id');
};

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

type SignUpResult = {
  email: string;
  needsEmailVerification: boolean;
};

type AuthContextValue = {
  session: AuthSession | null;
  user: AuthSessionUser | null;
  profile: MeResponse | null;
  authError: string | null;
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
  requestPasswordReset: (email: string) => Promise<void>;
  completeRecoverySession: (code: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setActiveOrgId: (orgId: string | null) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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

const resolveAuthErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return 'Your CRM profile could not be loaded. Refresh to try again or sign in again.';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(readStoredAuthSession);
  const [user, setUser] = useState<AuthSessionUser | null>(() => readStoredAuthSession()?.user || null);
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(readStoredActiveOrgId);

  const syncSessionState = (nextSession: AuthSession | null) => {
    setSession(nextSession);
    setUser(nextSession?.user || null);
  };

  const applySession = (nextSession: AuthSession | null) => {
    writeStoredAuthSession(nextSession);
    syncSessionState(nextSession);
  };

  const clearLocalAuthState = () => {
    clearStoredAuthSession();
    syncSessionState(null);
    setProfile(null);
    setAuthError(null);
    setActiveOrgIdState(null);
    clearStoredActiveOrgId();
  };

  const handleUnauthorizedSession = async () => {
    clearLocalAuthState();
  };

  const loadProfileForToken = async (accessToken: string, orgId: string | null) => {
    try {
      const me = await fetchMe(accessToken, orgId);
      setProfile(me);
      setAuthError(null);
      return me;
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await handleUnauthorizedSession();
        return null;
      }

      setProfile(null);
      setAuthError(resolveAuthErrorMessage(error));
      return null;
    }
  };

  const getAccessToken = async () => {
    const accessToken = await getValidStoredAccessToken();
    syncSessionState(readStoredAuthSession());
    return accessToken;
  };

  const refreshProfile = async () => {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      setProfile(null);
      setAuthError(null);
      return;
    }

    setProfileLoading(true);
    try {
      const me = await loadProfileForToken(accessToken, activeOrgId);
      if (me) {
        setActiveOrgIdState(me.activeOrg.orgId || null);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    const data = await backendAuthRequest<{ session: AuthSession | null }>('/api/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
    });

    if (!data.session) {
      throw new Error('No session returned by the server');
    }

    applySession(data.session);
    await refreshProfile();
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<SignUpResult> => {
    setAuthError(null);
    const data = await backendAuthRequest<{
      email: string;
      needsEmailVerification: boolean;
      session: AuthSession | null;
    }>('/api/auth/register', {
      method: 'POST',
      body: {
        email,
        password,
        firstName,
        lastName,
      },
    });

    if (data.session) {
      applySession(data.session);
      await refreshProfile();
    }

    return {
      email: data.email || email,
      needsEmailVerification: Boolean(data.needsEmailVerification),
    };
  };

  const requestPasswordReset = async (email: string) => {
    await backendAuthRequest('/api/auth/password/reset-request', {
      method: 'POST',
      body: {
        email,
      },
    });
  };

  const completeRecoverySession = async (code: string) => {
    const data = await backendAuthRequest<{ session: AuthSession | null }>('/api/auth/recovery/exchange', {
      method: 'POST',
      body: {
        code,
      },
    });

    if (!data.session) {
      throw new Error('Recovery session was not returned by the server');
    }

    applySession(data.session);
    setAuthError(null);
  };

  const updatePassword = async (password: string) => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('Missing session token');
    }

    await backendAuthRequest('/api/auth/password/update', {
      method: 'PATCH',
      token: accessToken,
      body: {
        password,
      },
    });
  };

  const signOut = async () => {
    const currentSession = readStoredAuthSession();

    try {
      if (currentSession?.accessToken && currentSession.refreshToken) {
        await backendAuthRequest('/api/auth/logout', {
          method: 'POST',
          token: currentSession.accessToken,
          body: {
            refreshToken: currentSession.refreshToken,
          },
        });
      }
    } finally {
      clearLocalAuthState();
    }
  };

  const setActiveOrgId = async (orgId: string | null) => {
    setActiveOrgIdState(orgId);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        syncSessionState(readStoredAuthSession());
        setAuthError(null);

        if (readStoredAuthSession()?.accessToken) {
          await refreshProfile();
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrap().catch(() => {
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!session?.accessToken) {
      return;
    }

    refreshProfile().catch(() => {
      setProfile(null);
      setAuthError('Your CRM profile could not be refreshed. Refresh the page or sign in again.');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrgId]);

  useEffect(() => {
    if (activeOrgId) {
      window.sessionStorage.setItem('crm_active_org_id', activeOrgId);
    } else {
      clearStoredActiveOrgId();
    }
  }, [activeOrgId]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      authError,
      loading,
      profileLoading,
      activeOrgId,
      signIn,
      signUp,
      requestPasswordReset,
      completeRecoverySession,
      updatePassword,
      signOut,
      refreshProfile,
      setActiveOrgId,
      getAccessToken,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, user, profile, authError, loading, profileLoading, activeOrgId],
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
