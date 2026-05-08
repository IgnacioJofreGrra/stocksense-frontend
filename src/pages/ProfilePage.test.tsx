import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/authStore';
import { ProfilePage } from './ProfilePage';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

describe('ProfilePage', () => {
  it('muestra los datos del usuario autenticado', () => {
    useAuthStore.setState({
      user: {
        id: 'u1',
        email: 'maria@almacen.com',
        nombre: 'Maria',
        rol: 'dueno',
        comercioNombre: 'Almacen Maria',
        activo: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      isAuthenticated: true,
    });
    render(<ProfilePage />);
    expect(screen.getByDisplayValue('maria@almacen.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Maria')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Almacen Maria')).toBeInTheDocument();
  });

  it('valida que las contraseñas coincidan', async () => {
    useAuthStore.setState({
      user: {
        id: 'u1',
        email: 'a@b.com',
        nombre: 'X',
        rol: 'empleado',
        comercioNombre: 'Y',
        activo: true,
        createdAt: '',
        updatedAt: '',
      },
      isAuthenticated: true,
    });
    render(<ProfilePage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/contraseña actual/i), 'actual123');
    await user.type(screen.getByLabelText(/^Nueva contraseña/i), 'nueva1234');
    await user.type(screen.getByLabelText(/confirmar nueva/i), 'distinta1');
    await user.click(screen.getByRole('button', { name: /cambiar contraseña/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/no coinciden/i);
  });
});
