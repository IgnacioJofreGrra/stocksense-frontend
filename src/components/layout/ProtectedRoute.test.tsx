import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useAuthStore } from '@/stores/authStore';
import { ProtectedRoute } from './ProtectedRoute';

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/secret" element={<div>contenido protegido</div>} />
        </Route>
        <Route path="/login" element={<div>pagina de login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('muestra loader durante isInitializing', () => {
    useAuthStore.setState({ isInitializing: true, isAuthenticated: false });
    renderWithRouter('/secret');
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('redirige a /login si no esta autenticado', () => {
    useAuthStore.setState({ isInitializing: false, isAuthenticated: false });
    renderWithRouter('/secret');
    expect(screen.getByText(/pagina de login/i)).toBeInTheDocument();
  });

  it('renderiza contenido si esta autenticado', () => {
    useAuthStore.setState({ isInitializing: false, isAuthenticated: true });
    renderWithRouter('/secret');
    expect(screen.getByText(/contenido protegido/i)).toBeInTheDocument();
  });
});
