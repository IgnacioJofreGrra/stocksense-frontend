import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Boxes,
  Brain,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ScanLine,
  UserCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  disabled?: boolean;
  /** Si es true, se renderiza con el estilo "destacado" (boton primario). */
  highlight?: boolean;
  /**
   * Si esta seteado, el item solo se muestra a los roles indicados.
   * Inteligencia es solo para dueno (decision producto: el empleado opera,
   * el dueno ve la estrategia).
   */
  roles?: UserRole[];
}

// Escaner primero — es la accion mas frecuente del dueño. highlight:true
// lo destaca visualmente. Inteligencia esta restringido a rol dueno tanto
// aca como en RoleGuard del router.
const NAV_ITEMS: NavItem[] = [
  { to: '/escanear', label: 'Escanear', icon: ScanLine, highlight: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/inventario', label: 'Inventario', icon: ClipboardList },
  { to: '/inteligencia', label: 'Inteligencia', icon: Brain, roles: ['dueno'] },
];

// Shell de las rutas autenticadas. Mobile-first: sidebar es drawer en
// mobile (overlay) y fija en md+. Items sin enlace (rol o feature todavia
// no disponible) se renderizan con opacity reducida.
export function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — drawer en mobile, fija en desktop */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-card transition-transform md:relative md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <Boxes className="h-5 w-5" />
            <span>StockSense</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => {
            // Filtro por rol: si el item tiene `roles` y el user no esta
            // en la lista, no lo renderizamos. La proteccion real esta en
            // el router (RoleGuard); esto es solo para que la sidebar no
            // muestre opciones que el usuario no puede usar.
            if (item.roles && (!user || !item.roles.includes(user.rol))) {
              return null;
            }
            if (item.disabled) {
              return (
                <div
                  key={item.to}
                  className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/50"
                  title="Disponible en proximas semanas"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              );
            }
            // Highlight (Escanear): mas grande + color primario incluso
            // cuando NO esta activo. Es la accion principal del operador.
            if (item.highlight) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-semibold transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-primary/10 text-primary hover:bg-primary/20',
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground',
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <Separator />

        <div className="p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sm"
            onClick={() => void handleLogout()}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </Button>
        </div>
      </aside>

      {/* Backdrop del sidebar en mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Main column */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              {user?.comercioNombre}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <span className="font-medium">{user?.nombre ?? '...'}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                  {user?.rol}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/perfil')}>
                <UserCircle className="mr-2 h-4 w-4" />
                Mi perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void handleLogout()}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto">
          <OfflineBanner />
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
