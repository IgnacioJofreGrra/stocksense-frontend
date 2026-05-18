import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/authStore';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('renderiza email, password y boton', () => {
    useAuthStore.setState({ isAuthenticated: false, isLoading: false, error: null });
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesion/i })).toBeInTheDocument();
  });

  it('llama a login del store al hacer submit', async () => {
    useAuthStore.setState({ isAuthenticated: false, isLoading: false, error: null });
    const loginSpy = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ login: loginSpy });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), 'test@x.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'secreto123');
    await user.click(screen.getByRole('button', { name: /iniciar sesion/i }));

    expect(loginSpy).toHaveBeenCalledWith({ email: 'test@x.com', password: 'secreto123' });
  });

  it('muestra mensaje de error si lo hay en el store', () => {
    useAuthStore.setState({
      isAuthenticated: false,
      isLoading: false,
      error: 'Credenciales invalidas',
    });
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/credenciales invalidas/i);
  });
});
