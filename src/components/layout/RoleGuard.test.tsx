import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { UserProfile } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { RoleGuard } from './RoleGuard';

/**
 * Tests del RoleGuard.
 *
 * Casos:
 * - sin user -> redirect a /login (no a redirectTo).
 * - rol permitido -> renderiza Outlet.
 * - rol no permitido -> redirect a redirectTo (default /dashboard).
 */
function renderWithRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<RoleGuard allow={['dueno']} />}>
          <Route path="/inteligencia" element={<div>contenido inteligencia</div>} />
        </Route>
        <Route path="/dashboard" element={<div>dashboard</div>} />
        <Route path="/login" element={<div>login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

const baseUser: UserProfile = {
  id: 'u-1',
  email: 'a@b.com',
  nombre: 'Juan',
  rol: 'dueno',
  comercioNombre: 'Almacen',
  activo: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('RoleGuard', () => {
  it('redirige a /login si no hay user', () => {
    useAuthStore.setState({ user: null });
    renderWithRoute('/inteligencia');
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it('renderiza el contenido si el rol esta permitido', () => {
    useAuthStore.setState({ user: { ...baseUser, rol: 'dueno' } });
    renderWithRoute('/inteligencia');
    expect(screen.getByText(/contenido inteligencia/i)).toBeInTheDocument();
  });

  it('redirige a /dashboard si el rol no esta permitido', () => {
    useAuthStore.setState({ user: { ...baseUser, rol: 'empleado' } });
    renderWithRoute('/inteligencia');
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.queryByText(/contenido inteligencia/i)).not.toBeInTheDocument();
  });
});
