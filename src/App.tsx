import { useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { apolloClient } from '@/lib/apollo';
import { AppRoutes } from '@/router';
import { useAuthStore } from '@/stores/authStore';

/**
 * App root.
 *
 * Orden de providers:
 * - ApolloProvider envuelve todo: incluso las paginas publicas pueden
 *   tener queries (no nuestro caso, pero el costo es cero).
 * - BrowserRouter para que useNavigate / useLocation funcionen.
 * - Toaster (sonner) montado una vez, fuera del Routes para que las
 *   notificaciones persistan al navegar.
 *
 * useEffect inicial: dispara authStore.initialize() para intentar
 * refrescar la sesion con el token persistido en localStorage.
 */
export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </ApolloProvider>
  );
}
