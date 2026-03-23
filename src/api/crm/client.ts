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
};

export const crmRequest = async (path: string, options: RequestOptions) => {
  const method = options.method || 'GET';
  const headers: Record<string, string> = {
    Authorization: `Bearer ${options.token}`,
    ...(options.orgId ? { 'x-org-id': options.orgId } : {}),
  };

  if (method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (networkError: any) {
    throw new Error(
      networkError?.message || 'Failed to fetch. Check backend URL, CORS, and server availability.',
    );
  }

  const payload = await response
    .json()
    .catch(() => ({ success: false, message: `Request failed (${response.status})` }));

  if (!response.ok || !payload.success) {
    const details = payload.error ? ` (${payload.error})` : '';
    throw new Error((payload.message || `API request failed (${response.status})`) + details);
  }

  return payload.data;
};
