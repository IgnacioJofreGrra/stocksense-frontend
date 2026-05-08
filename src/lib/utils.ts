import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * `cn(...classes)` — combina classnames con resolucion inteligente de
 * conflictos de Tailwind (la ultima clase gana). Es el helper estandar de
 * shadcn/ui que vamos a usar en todos los componentes.
 *
 * Ej: cn('px-2', condicion && 'px-4') -> "px-4" si condicion (px-4 pisa px-2).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
