import { supabase } from 'src/lib/supabase';

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

const getAuthHeaders = async (includeJson = false) => {
  const headers: Record<string, string> = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }

  const { data } = await supabase.auth.getSession();
  let currentSession = data.session;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expiresAt = currentSession?.expires_at || 0;
  if (currentSession && expiresAt > 0 && expiresAt <= nowInSeconds + 30) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (!refreshError && refreshed.session) {
      currentSession = refreshed.session;
    } else {
      currentSession = null;
    }
  }

  const token = currentSession?.access_token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const activeOrgId = localStorage.getItem('crm_active_org_id');
  if (activeOrgId) {
    headers['x-org-id'] = activeOrgId;
  }

  return headers;
};

const request = async (url: string, method: string, arg?: unknown) => {
  const includeJson = method !== 'GET';
  const response = await fetch(resolveUrl(url), {
    method,
    headers: await getAuthHeaders(includeJson),
    body: includeJson ? JSON.stringify(arg || {}) : undefined,
  });

  const payload = await response
    .json()
    .catch(() => ({ msg: 'Invalid server response', success: false }));

  if (!response.ok) {
    const message = payload?.message || payload?.msg || 'Request failed';
    const details = payload?.error ? ` (${payload.error})` : '';
    throw new Error(`${message}${details}`);
  }

  return payload;
};

const getFetcher = (url: string) => request(url, 'GET');
const postFetcher = (url: string, arg: unknown) => request(url, 'POST', arg);
const putFetcher = (url: string, arg: unknown) => request(url, 'PUT', arg);
const patchFetcher = (url: string, arg: unknown) => request(url, 'PATCH', arg);
const deleteFetcher = (url: string, arg: unknown) => request(url, 'DELETE', arg);

export { getFetcher, postFetcher, putFetcher, deleteFetcher, patchFetcher };
