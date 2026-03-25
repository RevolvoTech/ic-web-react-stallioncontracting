const DEFAULT_TIMEOUT_MS = 20000;

type FetchWithTimeoutOptions = RequestInit & {
  timeoutMs?: number;
};

export const isAbortError = (error: unknown) =>
  Boolean(error && typeof error === 'object' && 'name' in error && (error as { name?: string }).name === 'AbortError');

export const fetchWithTimeout = async (
  input: RequestInfo | URL,
  options: FetchWithTimeoutOptions = {},
) => {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal, ...init } = options;
  const controller = new AbortController();
  let didTimeout = false;

  const forwardAbort = () => {
    controller.abort();
  };

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', forwardAbort, { once: true });
    }
  }

  const timeoutId = globalThis.setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (didTimeout) {
      throw new Error('Request timed out. The CRM backend is taking too long to respond.');
    }

    throw error;
  } finally {
    globalThis.clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener('abort', forwardAbort);
    }
  }
};
