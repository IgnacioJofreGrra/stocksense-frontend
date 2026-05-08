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
  // El refresh token tambien lo mantenemos en memoria para evitar leer de
  // localStorage en cada request (es lectura sincronica pero igual es ruido).
  refreshToken: string | null;
  isAuthenticated: boolean;
  // isInitializing: cuando arranca la app, intentamos refrescar con el
  // token que haya en localStorage. Mientras dura ese intento, las rutas
  // protegidas muestran un loader (no redirigen a login todavia).
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

// Estado de auth. Refresh token en localStorage para sobrevivir recargas;
// access token solo en memoria (XSS no lo encuentra en storage). En
// initialize() leemos refresh -> intentamos refresh -> getProfile para
// hidratar `user`. Migracion a HttpOnly cookie queda pendiente (requiere
// CORS + cookie-parser en backend).
export const useAuthStore = create<AuthState>((set, get) => {
  // Conectamos apiFetch con el store para el flujo de refresh automatico
  // y el logout en 401 sin chance de refresh.
  configureApi({
    getAccessToken: () => get().accessToken,
    getRefreshToken: () => get().refreshToken,
    setTokens: (access, refresh) => get().setTokens(access, refresh),
    onUnauthorized: () => {
      // Refresh fallo o no habia tokens -> limpiar estado.
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
      // Mejor esfuerzo: si la llamada falla (red, token expirado), igual
      // limpiamos el estado local. La sesion del lado del server se
      // invalida cuando el refresh token vence.
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

    /**
     * Al iniciar la app: si hay refresh token guardado, intenta renovar.
     * Si OK, hidrata el user con getProfile (porque /auth/refresh solo
     * devuelve tokens). Si falla, queda en estado no autenticado.
     */
    initialize: async () => {
      const stored = localStorage.getItem(REFRESH_KEY);
      if (!stored) {
        set({ isInitializing: false });
        return;
      }
      try {
        const response = await authService.refresh(stored);
        // Ya tenemos los tokens; hidratamos el user con getProfile.
        // configureApi ya esta conectado, asi que apiFetch usara el nuevo
        // accessToken automaticamente.
        applyAuthResponse(set, response);
        // Refresca user data por si cambio comercioNombre, etc.
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
