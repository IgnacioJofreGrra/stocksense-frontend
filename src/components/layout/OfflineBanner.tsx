import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * OfflineBanner — barra superior visible solo cuando navigator.onLine
 * es false. Mensaje claro: estamos sirviendo del cache, los cambios
 * no se persisten hasta que vuelva la red.
 *
 * Lo posicionamos sticky al top del main, fuera del header del layout
 * para que siempre se vea arriba aun haciendo scroll.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-900 shadow-sm">
      <WifiOff className="h-4 w-4 flex-shrink-0" />
      <span>
        Sin conexion — mostrando datos guardados. Los cambios se perderan hasta que vuelva
        la red.
      </span>
    </div>
  );
}
