import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ApolloError } from '@apollo/client';

/**
 * Categoria de error que devuelve el backend de IA. Mapeada desde el
 * codigo HTTP/GraphQL de la respuesta:
 *
 * - rate-limit  -> 429 (AiThrottlerGuard, "Limite de consultas alcanzado")
 * - unavailable -> 503 (Groq caido, key no configurada o timeout)
 * - forbidden   -> 403 (rol empleado intento llamar a una query de IA)
 * - unknown     -> cualquier otra cosa (red, parse, etc.)
 *
 * El mensaje tipo "Reintentar en Xs" lleva el contador en segundos: lo
 * extraemos para alimentar el countdown del boton.
 */
export type AiErrorKind = 'rate-limit' | 'unavailable' | 'forbidden' | 'unknown';

export interface AiErrorInfo {
  kind: AiErrorKind;
  message: string;
  /** Solo presente en rate-limit. Segundos restantes hasta poder reintentar. */
  retryAfterSeconds?: number;
}

/**
 * Convierte un ApolloError (o Error generico) en AiErrorInfo. Es defensivo
 * porque el shape de extensions.code/status varia segun la version de
 * Apollo y la config del backend.
 */
export function classifyAiError(error: ApolloError | Error | undefined): AiErrorInfo | null {
  if (!error) return null;

  const apolloError = error as ApolloError;
  const graphQLErrors = apolloError.graphQLErrors ?? [];
  const first = graphQLErrors[0];

  // Apollo coloca el codigo en extensions.code (string) y a veces el status
  // numerico en extensions.status / extensions.exception.status.
  const ext = (first?.extensions ?? {}) as {
    code?: string;
    status?: number;
    statusCode?: number;
    exception?: { status?: number };
  };
  const code = ext.code;
  const status = ext.status ?? ext.statusCode ?? ext.exception?.status;
  const message = first?.message ?? error.message ?? 'Error desconocido';

  if (status === 429 || code === 'TOO_MANY_REQUESTS' || /limite.*consultas/i.test(message)) {
    return {
      kind: 'rate-limit',
      message,
      retryAfterSeconds: extractRetrySeconds(message),
    };
  }
  if (status === 403 || code === 'FORBIDDEN') {
    return { kind: 'forbidden', message };
  }
  if (status === 503 || code === 'SERVICE_UNAVAILABLE' || /no disponible/i.test(message)) {
    return { kind: 'unavailable', message };
  }
  return { kind: 'unknown', message };
}

/**
 * Lee "Reintentar en Xs" o "X segundos" del mensaje del backend. Si no lo
 * encuentra, default 60 (el throttler ttl es 60s para la ventana corta).
 */
function extractRetrySeconds(message: string): number {
  const match = message.match(/(\d+)\s*s(egundos)?/i);
  if (match) {
    const parsed = Number.parseInt(match[1], 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 60;
}

/**
 * useAiCountdown — countdown reactivo para el rate limit.
 *
 * Cuando AiErrorInfo trae kind: 'rate-limit', llamamos a `start(seconds)`.
 * El hook expone:
 * - secondsLeft: numero que decrece de seconds -> 0 cada segundo
 * - isBlocked: true mientras secondsLeft > 0 (para deshabilitar el boton)
 * - reset(): cancelar manualmente (ej: al cambiar de tab)
 *
 * Usamos un solo setInterval y guardamos el endTime en ref para que el
 * countdown sea preciso aunque React reschedulee renders.
 */
export function useAiCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const remainingMs = endTimeRef.current - Date.now();
    const remaining = Math.max(0, Math.ceil(remainingMs / 1000));
    setSecondsLeft(remaining);
    if (remaining <= 0) stop();
  }, [stop]);

  const start = useCallback(
    (seconds: number) => {
      stop();
      const safe = Math.max(1, Math.floor(seconds));
      endTimeRef.current = Date.now() + safe * 1000;
      setSecondsLeft(safe);
      intervalRef.current = setInterval(tick, 1000);
    },
    [stop, tick],
  );

  const reset = useCallback(() => {
    stop();
    setSecondsLeft(0);
    endTimeRef.current = 0;
  }, [stop]);

  // Cleanup al desmontar.
  useEffect(() => stop, [stop]);

  return useMemo(
    () => ({
      secondsLeft,
      isBlocked: secondsLeft > 0,
      start,
      reset,
    }),
    [secondsLeft, start, reset],
  );
}

/**
 * useElapsedTimer — contador en segundos mientras `running` es true.
 *
 * Lo usamos en los botones de "Analizar..." mientras Groq tarda 1-3s, asi
 * el operador ve "Analizando... 2s" y entiende que la app no se trabo.
 *
 * Si running=false, devolvemos 0 directo sin tocar state (asi evitamos
 * cascading renders y la regla react-hooks/set-state-in-effect).
 */
export function useElapsedTimer(running: boolean) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 200);
    return () => {
      clearInterval(interval);
      setElapsed(0);
    };
  }, [running]);

  return running ? elapsed : 0;
}
