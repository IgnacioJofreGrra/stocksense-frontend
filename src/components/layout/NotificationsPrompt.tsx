import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';
import { useState } from 'react';

export function NotificationsPrompt() {
  const { permission, yaPreguntamos, pedirPermiso } = useBrowserNotifications();
  const [cerrado, setCerrado] = useState(false);

  if (cerrado) return null;
  if (permission !== 'default') return null;
  if (yaPreguntamos) return null;

  const handleHabilitar = async () => {
    await pedirPermiso();
    setCerrado(true);
  };

  const handleCerrar = () => {
    // marcar como preguntado para no insistir en cada alerta
    localStorage.setItem('stocksense_notifications_asked', '1');
    setCerrado(true);
  };

  return (
    <div className="mb-4 flex flex-col gap-2 rounded-md border bg-blue-50 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2">
        <Bell className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-700" />
        <div>
          <p className="text-sm font-medium text-blue-900">
            Activar alertas en tiempo real
          </p>
          <p className="text-xs text-blue-700">
            Recibi un aviso cuando un producto baje del minimo, incluso con la pestaña en
            segundo plano.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => void handleHabilitar()}>
          Activar
        </Button>
        <Button size="icon" variant="ghost" onClick={handleCerrar} aria-label="Cerrar">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
