import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  updatedAt: Date | null;
  /** Minutos despues de los cuales mostramos warning de "datos viejos". */
  staleAfterMinutes?: number;
  className?: string;
}

/**
 * Formatea una fecha en hora local Argentina (es-AR), formato corto.
 * Ej: "08/05/2026 14:32"
 */
function formatTimestamp(d: Date): string {
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * FreshnessLabel — indicador de cuando se hizo el ultimo analisis.
 *
 * Muestra "Analisis basado en datos hasta {fecha}". Si paso mas de
 * staleAfterMinutes (default 30), pinta en ambar y agrega un hint para
 * que el dueno entienda que los datos pueden haber cambiado.
 *
 * El backend cachea 30 min, asi que coincide con el periodo en que la
 * info del frontend deberia considerarse "fresca".
 */
export function FreshnessLabel({
  updatedAt,
  staleAfterMinutes = 30,
  className,
}: Props) {
  // useState con initializer lazy: React permite Date.now en initializer
  // sin disparar la regla de purity. Refrescamos cada minuto para que el
  // estado "stale" aparezca solo cuando realmente paso el umbral.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!updatedAt) return null;

  const minutesAgo = Math.floor((now - updatedAt.getTime()) / 60000);
  const isStale = minutesAgo >= staleAfterMinutes;

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-xs',
        isStale ? 'text-amber-700' : 'text-muted-foreground',
        className,
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      <span>
        Analisis basado en datos hasta {formatTimestamp(updatedAt)}
        {isStale && ' — pulsar actualizar'}
      </span>
    </div>
  );
}
