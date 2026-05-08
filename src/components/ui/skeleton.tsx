import { cn } from '@/lib/utils';

/**
 * Skeleton — placeholder pulsing para estados de carga.
 *
 * Patron shadcn/ui pero generado a mano (la CLI lo agrega como
 * `skeleton` pero es trivial y lo escribimos directo). Lo usamos en
 * KPI cards y filas de tabla mientras Apollo busca data.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}
