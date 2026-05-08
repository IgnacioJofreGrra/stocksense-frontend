import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

/**
 * ProtectedRoute — guard de rutas que requieren auth.
 *
 * 3 estados:
 * 1. isInitializing: la app esta restaurando sesion (refresh con el token
 *    de localStorage). Mostramos un loader; NO redirigimos a /login porque
 *    quizas el user esta logueado y solo falta hidratar.
 * 2. !isAuthenticated post-init: redirect a /login.
 * 3. autenticado: renderiza la ruta hija.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
