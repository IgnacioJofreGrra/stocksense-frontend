import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'stocksense_notifications_asked';

type Permission = 'default' | 'granted' | 'denied' | 'unsupported';

// No pedimos permiso al cargar; se pide desde el banner. Guardamos en
// localStorage si ya preguntamos para no insistir en cada login.
export function useBrowserNotifications() {
  const [permission, setPermission] = useState<Permission>(() =>
    typeof window !== 'undefined' && 'Notification' in window
      ? (Notification.permission as Permission)
      : 'unsupported',
  );

  const yaPreguntamos = (): boolean =>
    typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1';

  const pedirPermiso = useCallback(async (): Promise<Permission> => {
    if (permission === 'unsupported') return 'unsupported';
    if (permission !== 'default') return permission;
    try {
      const result = await Notification.requestPermission();
      setPermission(result as Permission);
      localStorage.setItem(STORAGE_KEY, '1');
      return result as Permission;
    } catch {
      return 'denied';
    }
  }, [permission]);

  const notify = useCallback(
    (title: string, options?: NotificationOptions): void => {
      if (permission !== 'granted') return;
      try {
        new Notification(title, options);
      } catch {
        // Algunos navegadores tiran si el tab esta inactivo; el toast
        // in-app sigue mostrandose igual.
      }
    },
    [permission],
  );

  // Sincroniza el estado si otra tab cambia el permiso.
  useEffect(() => {
    if (permission === 'unsupported') return;
    const interval = setInterval(() => {
      const current = Notification.permission as Permission;
      setPermission((prev) => (prev !== current ? current : prev));
    }, 5000);
    return () => clearInterval(interval);
  }, [permission]);

  return {
    permission,
    yaPreguntamos: yaPreguntamos(),
    pedirPermiso,
    notify,
  };
}
