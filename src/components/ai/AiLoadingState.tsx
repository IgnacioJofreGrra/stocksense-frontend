import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useElapsedTimer } from '@/hooks/useAiQuery';

interface Props {
  /** Texto contextual: "tu inventario", "tus ventas", "tu proxima compra"... */
  message: string;
  /** Cantidad de skeletons a mostrar (default 3). */
  skeletons?: number;
  /**
   * Alto de cada skeleton en clases tailwind. Permite que cada tab use
   * placeholders del shape correcto (cards = h-40, tabla = h-12).
   */
  skeletonClassName?: string;
  /** Si es true, los skeletons se renderizan en grid; si no, en columna. */
  grid?: boolean;
}

/**
 * AiLoadingState — placeholder mientras Groq procesa (1-3s).
 *
 * El elapsed timer arriba ("Analizando... 2s") evita que el operador
 * piense que la app se trabo. Es un detalle minimo pero clave para
 * percepcion de performance — sin esto, 3s se sienten como 10s.
 */
export function AiLoadingState({
  message,
  skeletons = 3,
  skeletonClassName = 'h-40 w-full',
  grid = false,
}: Props) {
  const elapsed = useElapsedTimer(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 animate-pulse text-primary" />
        <span>
          {message}
          {elapsed > 0 && <span className="ml-2 tabular-nums">({elapsed}s)</span>}
        </span>
      </div>
      <div
        className={
          grid
            ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
            : 'space-y-3'
        }
      >
        {Array.from({ length: skeletons }).map((_, i) => (
          <Skeleton key={i} className={skeletonClassName} />
        ))}
      </div>
    </div>
  );
}
