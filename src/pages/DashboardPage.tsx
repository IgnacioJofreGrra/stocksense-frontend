import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Package, ScanLine } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationsPrompt } from '@/components/layout/NotificationsPrompt';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';
import {
  useAlertaStockBajoSubscription,
  useAlertasStockQuery,
  useResumenPeriodoQuery,
} from '@/generated/graphql';

/**
 * DashboardPage — landing autenticado.
 *
 * Compone:
 * 1. KPI cards con resumen del periodo (totales, promedio).
 * 2. Lista de alertas de stock (productos bajo el minimo).
 * 3. Subscription en vivo: cuando una salida deja stock bajo el minimo,
 *    sonner toast + Apollo refetch de las alertas para que la lista se
 *    actualice sin reload.
 */
export function DashboardPage() {
  const { data: resumen, loading: resumenLoading } = useResumenPeriodoQuery();
  const {
    data: alertas,
    loading: alertasLoading,
    refetch: refetchAlertas,
  } = useAlertasStockQuery();

  // Subscription: el backend filtra por userId, asi que solo recibimos
  // alertas de nuestro propio comercio. El payload viene tipado por codegen.
  const { data: subData } = useAlertaStockBajoSubscription();
  const { notify } = useBrowserNotifications();

  useEffect(() => {
    const alerta = subData?.alertaStockBajo;
    if (!alerta) return;
    const titulo = `${alerta.producto.nombre} llego a ${alerta.stockActual} unidades`;
    const detalle = `Minimo: ${alerta.stockMinimo}`;
    // Toast in-app: visible siempre.
    toast.warning(`${titulo} (${detalle})`, { duration: 6000 });
    // Notificacion del navegador: solo si el user la habilito. Funciona
    // incluso con la pestaña en segundo plano. tag dedupe: dos alertas
    // del mismo producto no apilan.
    notify(`Stock bajo: ${alerta.producto.nombre}`, {
      body: `${alerta.stockActual}/${alerta.stockMinimo} unidades`,
      icon: '/icon.svg',
      tag: `stock-${alerta.producto.id}`,
    });
    // Refrescamos la lista de alertas.
    void refetchAlertas();
  }, [subData, refetchAlertas, notify]);

  const r = resumen?.resumenPeriodo;
  const lista = alertas?.alertasStock ?? [];
  // Empty state global: si no hay actividad alguna, sugerimos empezar.
  const sinActividad =
    !resumenLoading &&
    r &&
    r.totalEntradas === 0 &&
    r.totalSalidas === 0 &&
    r.movimientosTotales === 0;

  return (
    <div className="space-y-6">
      <NotificationsPrompt />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen de actividad y alertas</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          label="Total entradas"
          value={r?.totalEntradas ?? 0}
          icon={<ArrowUpRight className="h-4 w-4 text-emerald-600" />}
          loading={resumenLoading}
        />
        <KpiCard
          label="Total salidas"
          value={r?.totalSalidas ?? 0}
          icon={<ArrowDownRight className="h-4 w-4 text-red-600" />}
          loading={resumenLoading}
        />
        <KpiCard
          label="Productos movidos"
          value={r?.productosUnicos ?? 0}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          loading={resumenLoading}
        />
        <KpiCard
          label="Promedio diario"
          value={r?.promedioDiarioVentas ?? 0}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
          loading={resumenLoading}
        />
      </div>

      {/* Alertas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle>Alertas de stock</CardTitle>
          </div>
          <Badge variant={lista.length > 0 ? 'destructive' : 'secondary'}>
            {lista.length}
          </Badge>
        </CardHeader>
        <CardContent>
          {alertasLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : lista.length === 0 ? (
            <div className="py-4 text-center">
              {sinActividad ? (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    Empeza escaneando tu primer producto
                  </p>
                  <Button asChild className="gap-2">
                    <Link to="/escanear">
                      <ScanLine className="h-4 w-4" />
                      Ir al escaner
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Todos los productos estan sobre el minimo. ¡Buen trabajo!
                </p>
              )}
            </div>
          ) : (
            <ul className="divide-y">
              {lista.map((a) => (
                <li
                  key={a.producto.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-medium">{a.producto.nombre}</p>
                    <p className="text-xs text-muted-foreground">EAN {a.producto.ean13}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm">
                        Stock:{' '}
                        <span
                          className={
                            a.stockActual <= 0
                              ? 'font-semibold text-destructive'
                              : 'font-semibold text-amber-600'
                          }
                        >
                          {a.stockActual}
                        </span>{' '}
                        / {a.stockMinimo}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Diferencia: {a.diferencia}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
}

function KpiCard({ label, value, icon, loading }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
