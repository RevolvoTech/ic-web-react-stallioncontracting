import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  AUTH_INVALIDATED_EVENT,
  AUTH_SESSION_UPDATED_EVENT,
  AuthSession,
  AuthSessionUser,
  backendAuthRequest,
  clearStoredAuthSession,
  getValidStoredAccessToken,
  readStoredAuthSession,
  writeStoredAuthSession,
} from 'src/lib/backendAuth';
import { fetchWithTimeout } from 'src/lib/fetchWithTimeout';

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

const sameSessionUser = (left: AuthSessionUser | null, right: AuthSessionUser | null) =>
  left?.id === right?.id && left?.email === right?.email;

const sameAuthSession = (left: AuthSession | null, right: AuthSession | null) => {
  if (!left || !right) {
    return left === right;
  }

  return (
    left.accessToken === right.accessToken &&
    left.refreshToken === right.refreshToken &&
    left.expiresAt === right.expiresAt &&
    left.expiresIn === right.expiresIn &&
    left.tokenType === right.tokenType &&
    sameSessionUser(left.user, right.user)
  );
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
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/me`, {
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
  const skipNextOrgRefreshRef = useRef(false);

  const syncSessionState = useCallback((nextSession: AuthSession | null) => {
    setSession((current) => (sameAuthSession(current, nextSession) ? current : nextSession));
    setUser((current) => {
      const nextUser = nextSession?.user || null;
      return sameSessionUser(current, nextUser) ? current : nextUser;
    });
  }, []);

  const applySession = useCallback((nextSession: AuthSession | null) => {
    writeStoredAuthSession(nextSession);
    syncSessionState(nextSession);
  }, [syncSessionState]);

  const clearLocalAuthState = useCallback(() => {
    clearStoredAuthSession();
    syncSessionState(null);
    setProfile(null);
    setAuthError(null);
    setActiveOrgIdState(null);
    clearStoredActiveOrgId();
  }, [syncSessionState]);

  const handleUnauthorizedSession = useCallback(async () => {
    clearLocalAuthState();
  }, [clearLocalAuthState]);

  const loadProfileForToken = useCallback(async (accessToken: string, orgId: string | null) => {
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
  }, [handleUnauthorizedSession]);

  const getAccessToken = useCallback(async () => {
    const accessToken = await getValidStoredAccessToken();
    const storedSession = readStoredAuthSession();
    syncSessionState(storedSession);
    return accessToken;
  }, [syncSessionState]);

  const refreshProfile = useCallback(async () => {
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
        const resolvedOrgId = me.activeOrg.orgId || null;
        if (resolvedOrgId !== activeOrgId) {
          skipNextOrgRefreshRef.current = true;
          setActiveOrgIdState(resolvedOrgId);
        }
      }
    } finally {
      setProfileLoading(false);
    }
  }, [activeOrgId, getAccessToken, loadProfileForToken]);

  const signIn = useCallback(async (email: string, password: string) => {
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
  }, [applySession, refreshProfile]);

  const signUp = useCallback(async (
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
  }, [applySession, refreshProfile]);

  const requestPasswordReset = useCallback(async (email: string) => {
    await backendAuthRequest('/api/auth/password/reset-request', {
      method: 'POST',
      body: {
        email,
      },
    });
  }, []);

  const completeRecoverySession = useCallback(async (code: string) => {
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
  }, [applySession]);

  const updatePassword = useCallback(async (password: string) => {
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
  }, [getAccessToken]);

  const signOut = useCallback(async () => {
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
  }, [clearLocalAuthState]);

  const setActiveOrgId = useCallback(async (orgId: string | null) => {
    setActiveOrgIdState((current) => (current === orgId ? current : orgId));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        syncSessionState(readStoredAuthSession());
        setAuthError(null);

        if (readStoredAuthSession()?.accessToken) {
          await refreshProfile();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    bootstrap().catch(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [refreshProfile, syncSessionState]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleSessionUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ session?: AuthSession | null }>).detail;
      const nextSession = detail?.session ?? readStoredAuthSession();
      syncSessionState(nextSession);
    };

    const handleAuthInvalidated = () => {
      clearLocalAuthState();
    };

    window.addEventListener(AUTH_SESSION_UPDATED_EVENT, handleSessionUpdated as EventListener);
    window.addEventListener(AUTH_INVALIDATED_EVENT, handleAuthInvalidated);

    return () => {
      window.removeEventListener(AUTH_SESSION_UPDATED_EVENT, handleSessionUpdated as EventListener);
      window.removeEventListener(AUTH_INVALIDATED_EVENT, handleAuthInvalidated);
    };
  }, [clearLocalAuthState, syncSessionState]);

  useEffect(() => {
    if (!session?.accessToken) {
      return;
    }

    if (skipNextOrgRefreshRef.current) {
      skipNextOrgRefreshRef.current = false;
      return;
    }

    refreshProfile().catch(() => {
      setProfile(null);
      setAuthError('Your CRM profile could not be refreshed. Refresh the page or sign in again.');
    });
  }, [activeOrgId, refreshProfile, session?.accessToken]);

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
    [
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
    ],
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
