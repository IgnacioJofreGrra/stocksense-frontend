import { Boxes } from 'lucide-react';

/**
 * PageLoader — fallback de Suspense mientras carga un chunk lazy.
 *
 * Aparece tipicamente <100ms al navegar a una ruta no cargada todavia.
 * Lo mantenemos simple: logo + spinner. Sin animaciones complejas porque
 * desaparece rapido.
 */
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
