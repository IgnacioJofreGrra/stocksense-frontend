import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useElapsedTimer } from '@/hooks/useAiQuery';

interface Props {
  message: string;
  skeletons?: number;
  skeletonClassName?: string;
  grid?: boolean;
}

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
