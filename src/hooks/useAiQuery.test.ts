import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { describe, expect, it } from 'vitest';
import { classifyAiError } from './useAiQuery';

function makeApolloError(message: string, extensions: Record<string, unknown> = {}): ApolloError {
  return new ApolloError({
    graphQLErrors: [new GraphQLError(message, { extensions })],
  });
}

describe('classifyAiError', () => {
  it('devuelve null si no hay error', () => {
    expect(classifyAiError(undefined)).toBeNull();
  });

  it('detecta rate-limit por extensions.code TOO_MANY_REQUESTS', () => {
    const err = makeApolloError('Limite alcanzado. Reintentar en 45s.', {
      code: 'TOO_MANY_REQUESTS',
    });
    const info = classifyAiError(err);
    expect(info?.kind).toBe('rate-limit');
    expect(info?.retryAfterSeconds).toBe(45);
  });

  it('detecta rate-limit por mensaje cuando no hay code', () => {
    const err = makeApolloError('Limite de consultas de IA alcanzado. Reintentar en 30s.');
    const info = classifyAiError(err);
    expect(info?.kind).toBe('rate-limit');
    expect(info?.retryAfterSeconds).toBe(30);
  });

  it('default a 60s si el mensaje no trae numero', () => {
    const err = makeApolloError('Limite de consultas alcanzado.', {
      code: 'TOO_MANY_REQUESTS',
    });
    const info = classifyAiError(err);
    expect(info?.retryAfterSeconds).toBe(60);
  });

  it('detecta unavailable por status 503', () => {
    const err = makeApolloError('Servicio caido', { status: 503 });
    expect(classifyAiError(err)?.kind).toBe('unavailable');
  });

  it('detecta unavailable por mensaje "no disponible"', () => {
    const err = makeApolloError('Servicio de IA temporalmente no disponible.');
    expect(classifyAiError(err)?.kind).toBe('unavailable');
  });

  it('detecta forbidden por extensions.code FORBIDDEN', () => {
    const err = makeApolloError('Solo dueno', { code: 'FORBIDDEN' });
    expect(classifyAiError(err)?.kind).toBe('forbidden');
  });

  it('cae a unknown para errores genericos', () => {
    const err = makeApolloError('algo raro paso');
    expect(classifyAiError(err)?.kind).toBe('unknown');
  });
});
