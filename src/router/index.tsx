import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageLoader } from '@/components/layout/PageLoader';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';

// Login/Register y AppLayout no son lazy a proposito: evitan el flash de
// loader al arrancar y un doble Suspense en cascada. El wrapper
// `.then(m => ({ default: m.X }))` adapta los named exports a lazy().
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
// AiInsightsPage es pesada (Recharts): lazy la mantiene fuera del bundle inicial.
const AiInsightsPage = lazy(() =>
  import('@/pages/AiInsightsPage').then((m) => ({ default: m.AiInsightsPage })),
);

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
          {/* /inteligencia: solo dueno. RoleGuard es la proteccion real;
              ocultarlo del sidebar es solo UX. */}
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
