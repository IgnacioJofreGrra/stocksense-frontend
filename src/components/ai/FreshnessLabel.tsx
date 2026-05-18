import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  updatedAt: Date | null;
  staleAfterMinutes?: number;
  className?: string;
}

function formatTimestamp(d: Date): string {
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// staleAfterMinutes default 30 coincide con el cache del backend
export function FreshnessLabel({
  updatedAt,
  staleAfterMinutes = 30,
  className,
}: Props) {
  // refresca cada minuto para que el estado "stale" aparezca al cruzar el umbral
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
