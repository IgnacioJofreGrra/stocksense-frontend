import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from './authStore';
import * as authService from '@/services/authService';

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitializing: false,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('setea tokens y usuario en login exitoso', async () => {
    const mockUser = {
      id: 'u1',
      email: 'a@b.com',
      nombre: 'Test',
      rol: 'dueno' as const,
      comercioNombre: 'Almacen',
      activo: true,
      createdAt: '2026-05-07',
      updatedAt: '2026-05-07',
    };
    vi.spyOn(authService.authService, 'login').mockResolvedValue({
      user: mockUser,
      accessToken: 'access-xxx',
      refreshToken: 'refresh-xxx',
    });

    await useAuthStore.getState().login({ email: 'a@b.com', password: 'secreto123' });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('access-xxx');
    expect(state.user?.email).toBe('a@b.com');
    expect(localStorage.getItem('stocksense_refresh_token')).toBe('refresh-xxx');
  });

  it('setea error y NO autentica si el login falla', async () => {
    vi.spyOn(authService.authService, 'login').mockRejectedValue(
      new Error('Credenciales invalidas'),
    );

    await expect(
      useAuthStore.getState().login({ email: 'x@x.com', password: 'mala' }),
    ).rejects.toThrow();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Credenciales invalidas');
  });

  it('limpia el estado y localStorage al hacer logout', async () => {
    vi.spyOn(authService.authService, 'logout').mockResolvedValue({ message: 'ok' });
    useAuthStore.setState({
      isAuthenticated: true,
      accessToken: 'a',
      refreshToken: 'r',
      user: { id: 'u' } as never,
    });
    localStorage.setItem('stocksense_refresh_token', 'r');

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(localStorage.getItem('stocksense_refresh_token')).toBeNull();
  });

  it('initialize: si no hay refresh token, queda no autenticado', async () => {
    await useAuthStore.getState().initialize();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitializing).toBe(false);
  });

  it('initialize: si refresh falla, limpia estado', async () => {
    localStorage.setItem('stocksense_refresh_token', 'token-vencido');
    vi.spyOn(authService.authService, 'refresh').mockRejectedValue(new Error('expirado'));

    await useAuthStore.getState().initialize();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(localStorage.getItem('stocksense_refresh_token')).toBeNull();
  });
});
