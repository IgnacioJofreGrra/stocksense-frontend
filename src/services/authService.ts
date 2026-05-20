import { apiFetch } from '@/lib/api';

// Tipos del backend REST. No vienen del codegen porque ese genera tipos
// GraphQL y auth vive en REST.
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
  // Si el server tiene Turnstile habilitado, el guard lo exige.
  turnstileToken?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Wrapper sobre los endpoints REST de /auth/*.
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
