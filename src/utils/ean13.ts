/**
 * Validador EAN-13 con digito verificador.
 *
 * Replica la logica del backend (src/common/validators/ean13.validator.ts):
 * - 13 digitos numericos.
 * - Digito 13 = (10 - (sum % 10)) % 10, donde sum es la suma ponderada de
 *   los primeros 12 digitos (impares peso 1, pares peso 3, 1-indexed).
 *
 * Por que duplicar la logica en el frontend:
 * - Feedback inmediato al usuario al escribir o escanear (no esperar al
 *   round-trip al backend).
 * - El backend igual valida — esta es defensa en cliente, no la unica.
 */
export function isValidEan13(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (!/^\d{13}$/.test(value)) return false;

  let suma = 0;
  for (let i = 0; i < 12; i++) {
    const digito = Number(value.charAt(i));
    // i=0 -> posicion 1 (impar) -> peso 1.
    // i=1 -> posicion 2 (par)   -> peso 3.
    const peso = (i + 1) % 2 === 0 ? 3 : 1;
    suma += digito * peso;
  }
  const checkEsperado = (10 - (suma % 10)) % 10;
  const checkRecibido = Number(value.charAt(12));
  return checkEsperado === checkRecibido;
}

/**
 * Estados posibles de validacion mientras el usuario escribe. Util para
 * mostrar el feedback en el UI (verde / rojo / neutro).
 */
export type Ean13Validation =
  | { kind: 'empty' }
  | { kind: 'incomplete'; faltantes: number }
  | { kind: 'invalid-format' }
  | { kind: 'invalid-checksum' }
  | { kind: 'valid' };

export function validateEan13(value: string): Ean13Validation {
  if (value.length === 0) return { kind: 'empty' };
  if (!/^\d*$/.test(value)) return { kind: 'invalid-format' };
  if (value.length < 13) return { kind: 'incomplete', faltantes: 13 - value.length };
  if (value.length > 13) return { kind: 'invalid-format' };
  if (!isValidEan13(value)) return { kind: 'invalid-checksum' };
  return { kind: 'valid' };
}
