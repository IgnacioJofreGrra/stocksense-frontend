import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge de classnames con resolucion de conflictos de Tailwind (ultima gana).
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
