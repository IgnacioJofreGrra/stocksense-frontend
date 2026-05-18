import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

interface RoleGuardProps {
  allow: UserRole[];
  redirectTo?: string;
}

// el backend tambien filtra por rol; este guard solo evita el flash de pagina
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
