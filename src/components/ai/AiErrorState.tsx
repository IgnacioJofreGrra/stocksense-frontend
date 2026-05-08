import { AlertTriangle, Clock, Lock, RefreshCcw, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { AiErrorInfo } from '@/hooks/useAiQuery';

interface Props {
  info: AiErrorInfo;
  /** Segundos restantes del countdown (solo aplica a rate-limit). */
  secondsLeft?: number;
  onRetry?: () => void;
}

/**
 * AiErrorState — render unificado para los 4 escenarios de error de IA.
 *
 * Cada caso tiene su mensaje en castellano y su accion sugerida:
 * - rate-limit: countdown con boton deshabilitado.
 * - unavailable: explica que el servicio falla pero el inventario sigue
 *   funcionando (importante para no asustar al dueno).
 * - forbidden: solo dueno (no deberia llegar aca por el RoleGuard).
 * - unknown: mensaje generico + reintentar.
 */
export function AiErrorState({ info, secondsLeft = 0, onRetry }: Props) {
  if (info.kind === 'rate-limit') {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <Clock className="h-8 w-8 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-900">
              Limite de consultas alcanzado
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Para no saturar el servicio de IA, hay un limite de 3 consultas
              por minuto. Podes consultar de nuevo en {secondsLeft || '...'}s.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={secondsLeft > 0}
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            {secondsLeft > 0 ? `Esperar ${secondsLeft}s...` : 'Reintentar'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (info.kind === 'unavailable') {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <ServerCrash className="h-8 w-8 text-blue-600" />
          <div>
            <p className="font-semibold text-blue-900">
              Servicio de IA no disponible
            </p>
            <p className="mt-1 text-sm text-blue-800">
              La inteligencia del negocio no esta disponible en este momento.
              El resto de tu inventario sigue funcionando normalmente.
            </p>
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Reintentar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (info.kind === 'forbidden') {
    return (
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <Lock className="h-8 w-8 text-slate-600" />
          <p className="font-semibold text-slate-900">
            La inteligencia del negocio solo esta disponible para el dueno del
            comercio.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/40">
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <div>
          <p className="font-semibold">
            Ocurrio un error al consultar la IA
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{info.message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Reintentar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
