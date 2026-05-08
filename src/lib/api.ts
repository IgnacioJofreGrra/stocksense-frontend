/**
 * Cliente REST minimo sobre fetch.
 *
 * Decisiones:
 * - fetch nativo (no axios): un wrapper de ~50 lineas, axios suma 13kb sin
 *   beneficio para nuestra superficie REST (auth + scanner EAN).
 * - Refresh automatico en 401: si tenemos refresh token, intentamos
 *   renovar, guardamos los nuevos tokens y reejecutamos la request original.
 *   Si el refresh tambien falla -> logout.
 * - Single flight del refresh: si N requests fallan en simultaneo con 401,
 *   solo lanzamos UN refresh. Las demas esperan al mismo Promise. Sin esto,
 *   se hacen N refreshes en paralelo y N-1 invalidan los tokens recien
 *   emitidos por el primero (race).
 */

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * Hooks que el authStore registra para que apiFetch lea/escriba tokens
 * sin acoplar a Zustand (evita circular import store <-> api).
 */
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

/** Promise activa de refresh; null si no hay ninguna en vuelo. */
let refreshInFlight: Promise<string | null> | null = null;

/**
 * Intenta renovar el access token usando el refresh token. Devuelve el
 * nuevo access token o null si fallo.
 */
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

/**
 * Helper general. Agrega Bearer si hay access token. Si recibe 401 y no
 * estamos en /auth/refresh ni /auth/login, intenta refrescar y reejecuta.
 */
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

  // 401 con posibilidad de refresh (no en endpoints de auth/refresh para
  // evitar bucles infinitos).
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

  // 204 No Content: devolvemos undefined casteado.
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
