import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageLoader } from '@/components/layout/PageLoader';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';

/**
 * Code splitting: cada ruta protegida vive en su propio chunk.
 *
 * Decisiones:
 * - LoginPage / RegisterPage: NO lazy. Son las primeras pantallas visibles
 *   en una sesion no autenticada; cargarlas eagerly evita el flash de
 *   loader al primer arranque.
 * - AppLayout: NO lazy. Si fuese lazy junto con la ruta hija, habria un
 *   doble Suspense en cascada (loader del layout + loader de la pagina).
 * - Patron `.then(m => ({ default: m.X }))`: las paginas usan named
 *   exports (compatibles con tests). lazy() requiere default exports;
 *   el wrapper convierte uno al otro sin tocar las paginas.
 */
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const ProductsPage = lazy(() =>
  import('@/pages/ProductsPage').then((m) => ({ default: m.ProductsPage })),
);
const ScannerPage = lazy(() =>
  import('@/pages/ScannerPage').then((m) => ({ default: m.ScannerPage })),
);
const InventoryPage = lazy(() =>
  import('@/pages/InventoryPage').then((m) => ({ default: m.InventoryPage })),
);
const ProfilePage = lazy(() =>
  import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
// AiInsightsPage: pagina pesada (Recharts + 3 queries + lazy tabs internas).
// Lazy load la mantiene fuera del initial bundle — solo se baja cuando el
// dueno entra a /inteligencia.
const AiInsightsPage = lazy(() =>
  import('@/pages/AiInsightsPage').then((m) => ({ default: m.AiInsightsPage })),
);

/**
 * Mapa de rutas:
 * - /login, /register -> publicas. Si el user ya esta autenticado,
 *   esos componentes redirigen a /dashboard internamente.
 * - todo lo demas pasa por <ProtectedRoute /> que verifica el store.
 *   Adentro del Outlet, AppLayout pinta el shell y los hijos lazy se
 *   renderizan dentro del Suspense.
 * - "*" cualquier ruta no matcheada -> redirect a /dashboard. ProtectedRoute
 *   se encarga de mandar a /login si no hay sesion.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="/escanear"
            element={
              <Suspense fallback={<PageLoader />}>
                <ScannerPage />
              </Suspense>
            }
          />
          <Route
            path="/productos"
            element={
              <Suspense fallback={<PageLoader />}>
                <ProductsPage />
              </Suspense>
            }
          />
          <Route
            path="/inventario"
            element={
              <Suspense fallback={<PageLoader />}>
                <InventoryPage />
              </Suspense>
            }
          />
          <Route
            path="/perfil"
            element={
              <Suspense fallback={<PageLoader />}>
                <ProfilePage />
              </Suspense>
            }
          />
          {/*
           * /inteligencia: solo dueno. RoleGuard envuelve y redirige a
           * /dashboard si el rol no es dueno. Es la proteccion real (la
           * ocultacion en sidebar es solo UX).
           */}
          <Route element={<RoleGuard allow={['dueno']} />}>
            <Route
              path="/inteligencia"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AiInsightsPage />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
