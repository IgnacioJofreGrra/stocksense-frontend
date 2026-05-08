import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'stocksense_notifications_asked';

type Permission = 'default' | 'granted' | 'denied' | 'unsupported';

/**
 * useBrowserNotifications — gestion de la Notification API del navegador.
 *
 * Estados:
 * - unsupported: el navegador (o iOS Safari < 16.4) no implementa la API.
 * - default: nunca pedimos permiso.
 * - granted/denied: ya respondio.
 *
 * Diseño: NO pedimos permiso al cargar (mala UX). Lo pedimos cuando el
 * usuario lo elige (banner) o cuando intenta una accion que se beneficia
 * de notificaciones. Recordamos en localStorage si ya intentamos pedir
 * para no insistir en cada login.
 */
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
        // tag dedupe: dos alertas del mismo producto no apilan, se reemplazan.
        new Notification(title, options);
      } catch {
        // Algunos navegadores tiran si el tab esta inactivo o si el SW
        // no esta listo. No es critico — el toast in-app sigue mostrandose.
      }
    },
    [permission],
  );

  // Sincronizamos el estado con cambios externos (otra tab cambia permiso, etc.).
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
