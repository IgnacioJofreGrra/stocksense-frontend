import * as Sentry from '@sentry/react';

// Inicializa Sentry si VITE_SENTRY_DSN esta seteado.
// Sin DSN, todo el SDK queda como no-op (util en dev).
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment:
      (import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined) ??
      (import.meta.env.MODE as string),
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    // Sample bajo de session replay: util para reproducir bugs sin saturar la cuota.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  });
}
