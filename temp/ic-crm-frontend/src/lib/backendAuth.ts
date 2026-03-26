import { fetchWithTimeout } from './fetchWithTimeout';

export type AuthSessionUser = {
  id: string;
  email: string | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number | null;
  expiresIn: number | null;
  tokenType: string | null;
  user: AuthSessionUser | null;
};

const AUTH_SESSION_KEY = 'crm_auth_session';
export const AUTH_SESSION_UPDATED_EVENT = 'crm-auth-session-updated';
export const AUTH_INVALIDATED_EVENT = 'crm-auth-invalidated';

const resolveApiBaseUrl = () => {
  const raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return String(raw).replace(/\/+$/, '').replace(/\/api$/, '');
};

const API_BASE_URL = resolveApiBaseUrl();

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.sessionStorage;
};

const dispatchBrowserEvent = (eventName: string, detail?: Record<string, unknown>) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};

const normalizeAuthSession = (value: any): AuthSession | null => {
  if (!value || typeof value !== 'object' || !value.accessToken) {
    return null;
  }

  return {
    accessToken: String(value.accessToken),
    refreshToken: value.refreshToken ? String(value.refreshToken) : null,
    expiresAt: Number.isFinite(Number(value.expiresAt)) ? Number(value.expiresAt) : null,
    expiresIn: Number.isFinite(Number(value.expiresIn)) ? Number(value.expiresIn) : null,
    tokenType: value.tokenType ? String(value.tokenType) : null,
    user:
      value.user && typeof value.user === 'object' && value.user.id
        ? {
            id: String(value.user.id),
            email: value.user.email ? String(value.user.email) : null,
          }
        : null,
  };
};

export const readStoredAuthSession = () => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(AUTH_SESSION_KEY);
    if (!raw) {
      return null;
    }
    return normalizeAuthSession(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const writeStoredAuthSession = (session: AuthSession | null) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (!session) {
    storage.removeItem(AUTH_SESSION_KEY);
    dispatchBrowserEvent(AUTH_SESSION_UPDATED_EVENT, { session: null });
    return;
  }

  storage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  dispatchBrowserEvent(AUTH_SESSION_UPDATED_EVENT, { session });
};

export const clearStoredAuthSession = () => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.removeItem(AUTH_SESSION_KEY);
  dispatchBrowserEvent(AUTH_SESSION_UPDATED_EVENT, { session: null });
};

export const notifyAuthInvalidated = (reason = 'unauthorized') => {
  dispatchBrowserEvent(AUTH_INVALIDATED_EVENT, { reason });
};

type BackendRequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
};

export const backendAuthRequest = async <T,>(path: string, options: BackendRequestOptions = {}) => {
  const method = options.method || 'GET';
  const headers: Record<string, string> = {};

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  const payload = await response
    .json()
    .catch(() => ({ success: false, message: `Request failed (${response.status})` }));

  if (!response.ok || !payload.success) {
    const details = payload.error ? ` (${payload.error})` : '';
    const error = new Error((payload.message || `Request failed (${response.status})`) + details) as Error & {
      status?: number;
    };
    error.status = response.status;
    if (response.status === 401) {
      notifyAuthInvalidated('unauthorized');
    }
    throw error;
  }

  return payload.data as T;
};

const isSessionExpiringSoon = (session: AuthSession, thresholdSeconds = 30) => {
  if (!session.expiresAt) {
    return false;
  }
  return session.expiresAt <= Math.floor(Date.now() / 1000) + thresholdSeconds;
};

export const refreshStoredAuthSession = async () => {
  const currentSession = readStoredAuthSession();
  if (!currentSession?.refreshToken) {
    clearStoredAuthSession();
    if (currentSession) {
      notifyAuthInvalidated('missing_refresh_token');
    }
    return null;
  }

  const data = await backendAuthRequest<{ session: AuthSession | null }>('/api/auth/refresh', {
    method: 'POST',
    body: {
      refreshToken: currentSession.refreshToken,
    },
  });

  const nextSession = normalizeAuthSession(data.session);
  writeStoredAuthSession(nextSession);
  return nextSession;
};

export const getValidStoredAccessToken = async () => {
  let session = readStoredAuthSession();
  if (!session) {
    return null;
  }

  if (isSessionExpiringSoon(session)) {
    try {
      session = await refreshStoredAuthSession();
    } catch {
      clearStoredAuthSession();
      notifyAuthInvalidated('refresh_failed');
      return null;
    }
  }

  return session?.accessToken || null;
};
