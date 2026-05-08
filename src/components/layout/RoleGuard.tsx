import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

interface RoleGuardProps {
  /** Roles permitidos para esta ruta. */
  allow: UserRole[];
  /** A donde mandar si el rol no esta permitido. Por defecto /dashboard. */
  redirectTo?: string;
}

/**
 * RoleGuard — protege rutas por rol.
 *
 * Uso tipico: las rutas de inteligencia/IA solo son para `dueno`. Si un
 * empleado navega manualmente a /inteligencia, lo redirigimos a /dashboard.
 *
 * Importante: ocultar el item en el sidebar es UX, no seguridad. El backend
 * tambien filtra por rol, pero el guard evita el flash de la pagina y la
 * llamada inutil a la API.
 */
export function RoleGuard({ allow, redirectTo = '/dashboard' }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(user.rol)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
