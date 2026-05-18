import { useMemo, useState } from 'react';
import { PartyPopper, RefreshCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  type PrediccionRestockFragment,
  usePredecirReposicionLazyQuery,
} from '@/generated/graphql';
import { classifyAiError, useAiCountdown, useElapsedTimer } from '@/hooks/useAiQuery';
import { AiErrorState } from './AiErrorState';
import { AiLoadingState } from './AiLoadingState';
import { FreshnessLabel } from './FreshnessLabel';
import { PrediccionCard } from './PrediccionCard';

const URGENCIA_RANK: Record<string, number> = {
  alta: 0,
  urgente: 0,
  critica: 0,
  media: 1,
  baja: 2,
};

// urgencia alta primero, luego dias hasta agotamiento ascendente
function ordenarPredicciones(
  predicciones: PrediccionRestockFragment[],
): PrediccionRestockFragment[] {
  return [...predicciones].sort((a, b) => {
    const ra = URGENCIA_RANK[a.urgencia.toLowerCase()] ?? 3;
    const rb = URGENCIA_RANK[b.urgencia.toLowerCase()] ?? 3;
    if (ra !== rb) return ra - rb;
    return a.diasHastaAgotamiento - b.diasHastaAgotamiento;
  });
}

export function PrediccionesTab() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const countdown = useAiCountdown();

  // network-only: ignora el cache de Apollo, el backend ya cachea 30min
  const [fetchPredicciones, { data, loading, error }] = usePredecirReposicionLazyQuery({
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

  const predicciones = useMemo(
    () => (data ? ordenarPredicciones(data.predecirReposicion) : []),
    [data],
  );

  const handleAnalizar = () => {
    if (countdown.isBlocked) return;
    void fetchPredicciones();
  };

  const elapsed = useElapsedTimer(loading);
  const hasResults = predicciones.length > 0;
  const isEmpty = data && predicciones.length === 0;

  return (
    <div className="space-y-4">
      {!data && !loading && !error && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <Sparkles className="h-10 w-10 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">
                Predicciones de reposicion
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                La IA analiza tus movimientos de stock y estima cuando se va
                a agotar cada producto. Tarda 1-3 segundos.
              </p>
            </div>
            <Button onClick={handleAnalizar} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Analizar mi inventario
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <AiLoadingState
          message={`La IA esta analizando tu inventario... (1-3 segundos)${
            elapsed > 0 ? '' : ''
          }`}
          skeletons={6}
          skeletonClassName="h-56 w-full"
          grid
        />
      )}

      {errorInfo && !loading && (
        <AiErrorState
          info={errorInfo}
          secondsLeft={countdown.secondsLeft}
          onRetry={countdown.isBlocked ? undefined : handleAnalizar}
        />
      )}

      {isEmpty && !loading && !errorInfo && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <PartyPopper className="h-10 w-10 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-900">
                Tu inventario esta bien abastecido.
              </p>
              <p className="mt-1 text-sm text-emerald-800">
                No hay productos en riesgo de agotarse en los proximos 14 dias.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleAnalizar} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Volver a analizar
            </Button>
          </CardContent>
        </Card>
      )}

      {hasResults && !loading && !errorInfo && (
        <>
          <div className="flex items-center justify-between gap-3">
            <FreshnessLabel updatedAt={lastUpdated} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalizar}
              disabled={countdown.isBlocked}
              className="gap-2"
              title="Volver a consultar a la IA con los datos mas recientes"
            >
              <RefreshCcw className="h-4 w-4" />
              {countdown.isBlocked
                ? `Esperar ${countdown.secondsLeft}s`
                : 'Actualizar analisis'}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {predicciones.map((p) => (
              <PrediccionCard key={p.productoId} prediccion={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
