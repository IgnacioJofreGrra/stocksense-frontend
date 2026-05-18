import { create } from 'zustand';
import {
  authService,
  type AuthResponse,
  type LoginData,
  type RegisterData,
  type UserProfile,
} from '@/services/authService';
import { configureApi } from '@/lib/api';

const REFRESH_KEY = 'stocksense_refresh_token';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  // En memoria para no leer localStorage en cada request.
  refreshToken: string | null;
  isAuthenticated: boolean;
  // Mientras dura el refresh inicial, las rutas protegidas muestran un
  // loader en vez de redirigir a login.
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (access: string, refresh: string) => void;
  initialize: () => Promise<void>;
  clearError: () => void;
}

// Access token solo en memoria; refresh token en localStorage para
// sobrevivir recargas. TODO: migrar a cookie HttpOnly (requiere CORS +
// cookie-parser en el backend).
export const useAuthStore = create<AuthState>((set, get) => {
  configureApi({
    getAccessToken: () => get().accessToken,
    getRefreshToken: () => get().refreshToken,
    setTokens: (access, refresh) => get().setTokens(access, refresh),
    onUnauthorized: () => {
      localStorage.removeItem(REFRESH_KEY);
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    },
  });

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isInitializing: true,
    isLoading: false,
    error: null,

    setTokens: (access, refresh) => {
      localStorage.setItem(REFRESH_KEY, refresh);
      set({ accessToken: access, refreshToken: refresh });
    },

    login: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authService.login(data);
        applyAuthResponse(set, response);
      } catch (err) {
        set({ error: extractMessage(err), isLoading: false });
        throw err;
      }
    },

    register: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authService.register(data);
        applyAuthResponse(set, response);
      } catch (err) {
        set({ error: extractMessage(err), isLoading: false });
        throw err;
      }
    },

    logout: async () => {
      // Mejor esfuerzo: si la llamada falla, igual limpiamos el estado local.
      try {
        await authService.logout();
      } catch {
        // ignore
      }
      localStorage.removeItem(REFRESH_KEY);
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
      });
    },

    initialize: async () => {
      const stored = localStorage.getItem(REFRESH_KEY);
      if (!stored) {
        set({ isInitializing: false });
        return;
      }
      try {
        const response = await authService.refresh(stored);
        applyAuthResponse(set, response);
        // /auth/refresh solo devuelve tokens; hidratamos el user aparte.
        const user = await authService.getProfile();
        set({ user });
      } catch {
        localStorage.removeItem(REFRESH_KEY);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      } finally {
        set({ isInitializing: false });
      }
    },

    clearError: () => set({ error: null }),
  };
});

/** Helper: aplica la respuesta de login/register/refresh al store. */
function applyAuthResponse(
  set: (partial: Partial<AuthState>) => void,
  response: AuthResponse,
): void {
  localStorage.setItem(REFRESH_KEY, response.refreshToken);
  set({
    user: response.user,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  });
}

function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Error desconocido';
}
