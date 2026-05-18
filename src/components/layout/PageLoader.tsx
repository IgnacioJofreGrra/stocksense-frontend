import { Boxes } from 'lucide-react';

// fallback de Suspense para chunks lazy
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Boxes className="h-8 w-8 animate-pulse" />
        <p className="text-sm">Cargando...</p>
      </div>
    </div>
  );
}
