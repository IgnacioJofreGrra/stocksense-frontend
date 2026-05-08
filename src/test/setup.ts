import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * Setup global de Vitest:
 * - jest-dom matchers (toBeInTheDocument, toHaveTextContent, etc.).
 * - cleanup automatico despues de cada test para evitar leak de DOM
 *   entre casos.
 */
afterEach(() => {
  cleanup();
});
