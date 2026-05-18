import { useState } from 'react';
import { Calendar, Download, FileText, RefreshCcw, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGenerarOrdenCompraLazyQuery } from '@/generated/graphql';
import { classifyAiError, useAiCountdown } from '@/hooks/useAiQuery';
import { cn } from '@/lib/utils';
import { downloadOrdenCompraCsv } from '@/utils/ai-export';
import { AiErrorState } from './AiErrorState';
import { AiLoadingState } from './AiLoadingState';
import { FreshnessLabel } from './FreshnessLabel';

const PRIORIDAD_STYLE: Record<string, string> = {
  urgente: 'bg-red-100 text-red-900 border-red-200',
  alta: 'bg-red-100 text-red-900 border-red-200',
  normal: 'bg-amber-100 text-amber-900 border-amber-200',
  media: 'bg-amber-100 text-amber-900 border-amber-200',
  baja: 'bg-emerald-100 text-emerald-900 border-emerald-200',
};

function formatARS(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  });
}

// rango 7-30: menos deja sin margen, mas sobre-stockea perecederos
export function OrdenCompraTab() {
  const [diasCobertura, setDiasCobertura] = useState(14);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const countdown = useAiCountdown();

  const [fetchOrden, { data, loading, error }] = useGenerarOrdenCompraLazyQuery({
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

  const orden = data?.generarOrdenCompra;

  const handleGenerar = () => {
    if (countdown.isBlocked) return;
    void fetchOrden({ variables: { diasCobertura } });
  };

  const handleExportar = () => {
    if (orden) downloadOrdenCompraCsv(orden);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="dias-cobertura" className="text-sm font-medium">
              Dias de cobertura: <span className="tabular-nums">{diasCobertura}</span>
            </Label>
            <Input
              id="dias-cobertura"
              type="range"
              min={7}
              max={30}
              step={1}
              value={diasCobertura}
              onChange={(e) => setDiasCobertura(Number(e.target.value))}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              La IA calcula cuanto comprar para cubrir este periodo en base a tu
              consumo historico.
            </p>
          </div>
          <Button
            onClick={handleGenerar}
            disabled={loading || countdown.isBlocked}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {countdown.isBlocked
              ? `Esperar ${countdown.secondsLeft}s`
              : 'Generar orden de compra'}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <AiLoadingState
          message="La IA esta calculando tu proxima compra..."
          skeletons={5}
          skeletonClassName="h-12 w-full"
        />
      )}

      {errorInfo && !loading && (
        <AiErrorState
          info={errorInfo}
          secondsLeft={countdown.secondsLeft}
          onRetry={countdown.isBlocked ? undefined : handleGenerar}
        />
      )}

      {orden && !loading && !errorInfo && (
        <>
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <FreshnessLabel updatedAt={lastUpdated} />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerar}
                disabled={countdown.isBlocked}
                className="gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Actualizar
              </Button>
              <Button
                size="sm"
                onClick={handleExportar}
                disabled={orden.items.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar orden de compra
              </Button>
            </div>
          </div>

          {orden.items.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                La IA no encontro productos que necesiten reposicion para los
                proximos {diasCobertura} dias.
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Prioridad</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead className="hidden md:table-cell">EAN-13</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="hidden text-right md:table-cell">
                        P. Unit.
                      </TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="hidden lg:table-cell">Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orden.items.map((item) => (
                      <TableRow key={item.productoId}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'whitespace-nowrap text-xs font-semibold capitalize',
                              PRIORIDAD_STYLE[item.prioridad.toLowerCase()] ?? '',
                            )}
                          >
                            {item.prioridad}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{item.nombre}</TableCell>
                        <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                          {item.ean13}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {item.cantidadSugerida}
                        </TableCell>
                        <TableCell className="hidden text-right tabular-nums md:table-cell">
                          {formatARS(item.precioUnitarioEstimado)}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {formatARS(item.subtotalEstimado)}
                        </TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                          {item.motivo}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Resumen de la orden
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total estimado</span>
                <span
                  className="text-lg font-bold tabular-nums"
                  data-testid="total-estimado"
                >
                  {formatARS(orden.totalEstimado)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Fecha sugerida: <strong>{orden.fechaSugerida}</strong>
                </span>
              </div>
              {orden.notas && (
                <p className="rounded-md bg-background p-3 italic text-muted-foreground">
                  {orden.notas}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
