import {
  getValidStoredAccessToken,
  notifyAuthInvalidated,
  refreshStoredAuthSession,
} from 'src/lib/backendAuth';
import { fetchWithTimeout } from 'src/lib/fetchWithTimeout';

const resolveApiBaseUrl = () => {
  const raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return String(raw).replace(/\/+$/, '').replace(/\/api$/, '');
};

const API_BASE_URL = resolveApiBaseUrl();

const resolveUrl = (url: string) => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return `${API_BASE_URL}${url}`;
};

const getAuthHeaders = async (includeJson = false, accessToken?: string | null) => {
  const headers: Record<string, string> = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }

  const token = accessToken ?? (await getValidStoredAccessToken());
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const activeOrgId =
    typeof window === 'undefined' ? null : window.sessionStorage.getItem('crm_active_org_id');
  if (activeOrgId) {
    headers['x-org-id'] = activeOrgId;
  }

  return headers;
};

const parsePayload = async (response: Response) =>
  response.json().catch(() => ({ msg: 'Invalid server response', success: false }));

const request = async (url: string, method: string, arg?: unknown) => {
  const includeJson = method !== 'GET';
  const executeRequest = async (accessToken?: string | null) =>
    fetchWithTimeout(resolveUrl(url), {
      method,
      headers: await getAuthHeaders(includeJson, accessToken),
      body: includeJson ? JSON.stringify(arg || {}) : undefined,
    });

  let response = await executeRequest();
  let payload = await parsePayload(response);

  if (response.status === 401) {
    const refreshedSession = await refreshStoredAuthSession().catch(() => null);
    if (refreshedSession?.accessToken) {
      response = await executeRequest(refreshedSession.accessToken);
      payload = await parsePayload(response);
    }
  }

  if (!response.ok) {
    const message = payload?.message || payload?.msg || 'Request failed';
    const details = payload?.error ? ` (${payload.error})` : '';
    const error = new Error(`${message}${details}`) as Error & { status?: number };
    error.status = response.status;
    if (response.status === 401) {
      notifyAuthInvalidated('unauthorized');
    }
    throw error;
  }

  return payload;
};

const getFetcher = (url: string) => request(url, 'GET');
const postFetcher = (url: string, arg: unknown) => request(url, 'POST', arg);
const putFetcher = (url: string, arg: unknown) => request(url, 'PUT', arg);
const patchFetcher = (url: string, arg: unknown) => request(url, 'PATCH', arg);
const deleteFetcher = (url: string, arg: unknown) => request(url, 'DELETE', arg);

export { getFetcher, postFetcher, putFetcher, deleteFetcher, patchFetcher };
