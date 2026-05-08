import { apiFetch } from '@/lib/api';

/**
 * Tipos del backend (REST): los duplicamos aca con shape minima en lugar
 * de importar desde codegen. Razon: el codegen genera tipos GraphQL; los
 * de auth viven en REST y duplicar 4 interfaces es preferible a meter
 * Auth en GraphQL solo para reutilizar tipos.
 */
export type UserRole = 'dueno' | 'empleado';

export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
  comercioNombre: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  comercioNombre: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// authService — wrapper sobre los endpoints REST de /auth/*. Auth queda en
// REST (flujo secuencial, sin necesidad del cache de Apollo); el refresh
// token rota en cada uso.
export const authService = {
  register(data: RegisterData): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login(data: LoginData): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  refresh(refreshToken: string): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  logout(): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/auth/logout', { method: 'POST' });
  },

  getProfile(): Promise<UserProfile> {
    return apiFetch<UserProfile>('/auth/profile', { method: 'GET' });
  },
};
