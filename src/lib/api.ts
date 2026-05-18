const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Hooks que el authStore registra para leer/escribir tokens sin acoplar a
// Zustand (evita un circular import store <-> api).
type Hooks = {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (access: string, refresh: string) => void;
  onUnauthorized: () => void;
};

let hooks: Hooks = {
  getAccessToken: () => null,
  getRefreshToken: () => null,
  setTokens: () => {},
  onUnauthorized: () => {},
};

export function configureApi(newHooks: Hooks): void {
  hooks = newHooks;
}

// Single flight: si N requests fallan a la vez con 401, solo lanzamos UN
// refresh. Sin esto, los refreshes en paralelo se invalidan entre si.
let refreshInFlight: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  const refreshToken = hooks.getRefreshToken();
  if (!refreshToken) return null;

  refreshInFlight = (async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { accessToken: string; refreshToken: string };
      hooks.setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export interface ApiError extends Error {
  status: number;
  body?: unknown;
}

function makeError(status: number, body: unknown, message: string): ApiError {
  const err = new Error(message) as ApiError;
  err.status = status;
  err.body = body;
  return err;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retried = false,
): Promise<T> {
  const token = hooks.getAccessToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Excluimos /auth/* del refresh para evitar bucles infinitos.
  if (res.status === 401 && !retried && !path.startsWith('/auth/')) {
    const newToken = await tryRefresh();
    if (newToken) {
      return apiFetch<T>(path, options, true);
    }
    hooks.onUnauthorized();
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    const message =
      typeof body === 'object' && body && 'message' in body
        ? String((body as { message: unknown }).message)
        : `Request fallo con status ${res.status}`;
    throw makeError(res.status, body, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
