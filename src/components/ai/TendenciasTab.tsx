import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Lightbulb, RefreshCcw, Sparkles, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAnalizarTendenciasLazyQuery } from '@/generated/graphql';
import { classifyAiError, useAiCountdown } from '@/hooks/useAiQuery';
import { cn } from '@/lib/utils';
import { AiErrorState } from './AiErrorState';
import { AiLoadingState } from './AiLoadingState';
import { FreshnessLabel } from './FreshnessLabel';

type RangoDias = '7' | '30' | '90';

const RELEVANCIA_STYLE: Record<string, string> = {
  alta: 'bg-red-100 text-red-900 border-red-200',
  media: 'bg-amber-100 text-amber-900 border-amber-200',
  baja: 'bg-emerald-100 text-emerald-900 border-emerald-200',
};

/**
 * Calcula la fecha de inicio (formato ISO) restando N dias de hoy.
 * Lo pasamos como string al backend (DateRangeInput.desde es String).
 */
function fechaDesde(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString();
}

/**
 * Map del orden de los dias para que el grafico no salga aleatorio.
 * Si la IA devuelve "Lunes", "Sabado", "Martes", lo reordenamos lun -> dom.
 */
const ORDEN_DIAS: Record<string, number> = {
  lunes: 0,
  martes: 1,
  miercoles: 2,
  miércoles: 2,
  jueves: 3,
  viernes: 4,
  sabado: 5,
  sábado: 5,
  domingo: 6,
};

/**
 * Convierte un patron diario en data point para el BarChart. Asignamos un
 * "score" derivado de la relevancia para que el grafico tenga eje Y
 * significativo aunque el backend no devuelva una metrica numerica.
 */
function patronesADataPoints(
  patrones: Array<{ dia: string; insight: string; relevancia: string }>,
) {
  return [...patrones]
    .sort((a, b) => (ORDEN_DIAS[a.dia.toLowerCase()] ?? 99) - (ORDEN_DIAS[b.dia.toLowerCase()] ?? 99))
    .map((p) => ({
      dia: p.dia,
      relevancia: p.relevancia,
      score:
        p.relevancia.toLowerCase() === 'alta'
          ? 3
          : p.relevancia.toLowerCase() === 'media'
            ? 2
            : 1,
      insight: p.insight,
    }));
}

/**
 * patronesHorariosADataPoints — convierte franja horaria a puntos para el
 * AreaChart. El backend devuelve franjas tipo "manana", "mediodia", etc.
 */
function patronesHorariosADataPoints(
  patrones: Array<{ franja: string; insight: string }>,
) {
  return patrones.map((p, i) => ({
    franja: p.franja,
    insight: p.insight,
    actividad: 1 + (patrones.length - i),
  }));
}

/**
 * TendenciasTab — Tab "Analisis de Tendencias".
 *
 * 5 secciones:
 * 1. Resumen general de la IA (texto narrativo).
 * 2. Patrones por dia (BarChart + insights con badges).
 * 3. Patrones por hora (AreaChart + insights).
 * 4. Productos destacados (lista con patron detectado).
 * 5. Recomendaciones (3-5 items numerados, accionables).
 *
 * El selector de rango (7/30/90 dias) lo controlamos en estado local;
 * cada cambio dispara una nueva query con DateRangeInput.
 */
export function TendenciasTab() {
  const [rango, setRango] = useState<RangoDias>('30');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const countdown = useAiCountdown();

  const [fetchTendencias, { data, loading, error }] = useAnalizarTendenciasLazyQuery({
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted: () => setLastUpdated(new Date()),
    onError: (err) => {
      const info = classifyAiError(err);
      if (info?.kind === 'rate-limit' && info.retryAfterSeconds) {
        countdown.start(info.retryAfterSeconds);
      }
    },
  });
  const errorInfo = classifyAiError(error);

  const handleAnalizar = () => {
    if (countdown.isBlocked) return;
    void fetchTendencias({
      variables: {
        opciones: { desde: fechaDesde(Number(rango)) },
      },
    });
  };

  const tendencias = data?.analizarTendencias;
  const patronesDiarios = useMemo(
    () => (tendencias ? patronesADataPoints(tendencias.patronesDiarios) : []),
    [tendencias],
  );
  const patronesHorarios = useMemo(
    () => (tendencias ? patronesHorariosADataPoints(tendencias.patronesHorarios) : []),
    [tendencias],
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">Periodo a analizar</p>
            <p className="text-xs text-muted-foreground">
              La IA detecta patrones de venta en este rango y devuelve
              recomendaciones accionables.
            </p>
          </div>
          <Select value={rango} onValueChange={(v) => setRango(v as RangoDias)}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Ultimos 7 dias</SelectItem>
              <SelectItem value="30">Ultimos 30 dias</SelectItem>
              <SelectItem value="90">Ultimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleAnalizar}
            disabled={loading || countdown.isBlocked}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {countdown.isBlocked
              ? `Esperar ${countdown.secondsLeft}s`
              : 'Analizar tendencias'}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <AiLoadingState
          message="La IA esta buscando patrones en tus ventas..."
          skeletons={4}
          skeletonClassName="h-32 w-full"
        />
      )}

      {errorInfo && !loading && (
        <AiErrorState
          info={errorInfo}
          secondsLeft={countdown.secondsLeft}
          onRetry={countdown.isBlocked ? undefined : handleAnalizar}
        />
      )}

      {tendencias && !loading && !errorInfo && (
        <>
          <div className="flex items-center justify-between gap-3">
            <FreshnessLabel updatedAt={lastUpdated} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalizar}
              disabled={countdown.isBlocked}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Actualizar
            </Button>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <Sparkles className="mb-3 h-6 w-6 text-primary" />
              <p className="text-base font-medium leading-relaxed">
                <span className="text-2xl text-primary/40">&ldquo;</span>
                {tendencias.resumenGeneral}
                <span className="text-2xl text-primary/40">&rdquo;</span>
              </p>
            </CardContent>
          </Card>

          {patronesDiarios.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Patrones por dia de la semana
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={patronesDiarios}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dia" />
                      <YAxis hide />
                      <Tooltip
                        formatter={(_v, _n, item) => [
                          (item.payload as { insight: string }).insight,
                          'Insight',
                        ]}
                      />
                      <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tendencias.patronesDiarios.map((p, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className={cn(
                        'whitespace-normal text-xs',
                        RELEVANCIA_STYLE[p.relevancia.toLowerCase()] ?? '',
                      )}
                    >
                      <span className="font-semibold">{p.dia}:</span>
                      <span className="ml-1 font-normal">{p.insight}</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {patronesHorarios.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Patrones por franja horaria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={patronesHorarios}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="franja" />
                      <YAxis hide />
                      <Tooltip
                        formatter={(_v, _n, item) => [
                          (item.payload as { insight: string }).insight,
                          'Insight',
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="actividad"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <ul className="space-y-2 text-sm">
                  {tendencias.patronesHorarios.map((p, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-semibold">{p.franja}:</span>
                      <span className="text-muted-foreground">{p.insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {tendencias.productosDestacados.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Productos destacados</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tendencias.productosDestacados.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Star className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <span>
                        <span className="font-semibold">{p.nombre}</span>
                        <span className="ml-2 text-muted-foreground">{p.patron}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {tendencias.recomendaciones.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="text-base">Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {tendencias.recomendaciones.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-md border border-amber-200 bg-white p-3 text-sm shadow-sm"
                    >
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <span>
                        <span className="mr-1 font-semibold text-amber-900">
                          {i + 1}.
                        </span>
                        {r}
                      </span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
