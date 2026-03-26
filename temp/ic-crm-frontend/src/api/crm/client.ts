import {
  notifyAuthInvalidated,
  refreshStoredAuthSession,
} from 'src/lib/backendAuth';
import { fetchWithTimeout, isAbortError } from 'src/lib/fetchWithTimeout';

const resolveApiBaseUrl = () => {
  const raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return String(raw).replace(/\/+$/, '').replace(/\/api$/, '');
};

const API_BASE_URL = resolveApiBaseUrl();

type RequestOptions = {
  token: string;
  orgId?: string | null;
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
};

export const crmRequest = async (path: string, options: RequestOptions) => {
  const method = options.method || 'GET';
  const buildHeaders = (token: string) => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      ...(options.orgId ? { 'x-org-id': options.orgId } : {}),
    };

    if (method !== 'GET' && method !== 'HEAD') {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  };

  const executeRequest = async (token: string) => {
    try {
      return await fetchWithTimeout(`${API_BASE_URL}${path}`, {
        method,
        headers: buildHeaders(token),
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: options.signal,
      });
    } catch (networkError: any) {
      if (isAbortError(networkError)) {
        throw networkError;
      }

      throw new Error(
        networkError?.message || 'Failed to fetch. Check backend URL, CORS, and server availability.',
      );
    }
  };

  const parsePayload = async (response: Response) =>
    response
      .json()
      .catch(() => ({ success: false, message: `Request failed (${response.status})` }));

  let response = await executeRequest(options.token);
  let payload = await parsePayload(response);

  if (response.status === 401) {
    const refreshedSession = await refreshStoredAuthSession().catch(() => null);
    if (refreshedSession?.accessToken) {
      response = await executeRequest(refreshedSession.accessToken);
      payload = await parsePayload(response);
    }
  }

  if (!response.ok || !payload.success) {
    const details = payload.error ? ` (${payload.error})` : '';
    if (response.status === 401) {
      notifyAuthInvalidated('unauthorized');
    }
    throw new Error((payload.message || `API request failed (${response.status})`) + details);
  }

  return payload.data;
};
