import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ApolloError } from '@apollo/client';

// Categoria de error del backend de IA, mapeada desde el status HTTP:
// 429 rate-limit, 503 unavailable, 403 forbidden, resto unknown.
export type AiErrorKind = 'rate-limit' | 'unavailable' | 'forbidden' | 'unknown';

export interface AiErrorInfo {
  kind: AiErrorKind;
  message: string;
  /** Solo presente en rate-limit. Segundos restantes hasta poder reintentar. */
  retryAfterSeconds?: number;
}

// Defensivo: el shape de extensions.code/status varia segun la version de
// Apollo y la config del backend.
export function classifyAiError(error: ApolloError | Error | undefined): AiErrorInfo | null {
  if (!error) return null;

  const apolloError = error as ApolloError;
  const graphQLErrors = apolloError.graphQLErrors ?? [];
  const first = graphQLErrors[0];

  // El status numerico puede venir en distintas claves segun el backend.
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

// Default 60s si el mensaje no trae numero: es el ttl del throttler.
function extractRetrySeconds(message: string): number {
  const match = message.match(/(\d+)\s*s(egundos)?/i);
  if (match) {
    const parsed = Number.parseInt(match[1], 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 60;
}

// Countdown para el rate limit. Guardamos endTime en ref para que sea
// preciso aunque React reschedulee renders.
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

// Contador en segundos mientras `running` es true; con running=false
// devolvemos 0 sin tocar state para evitar cascading renders.
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
