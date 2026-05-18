// Validacion EAN-13 client-side para feedback inmediato al escribir/escanear.
// Replica la logica del backend (src/common/validators/ean13.validator.ts).
export function isValidEan13(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (!/^\d{13}$/.test(value)) return false;

  let suma = 0;
  for (let i = 0; i < 12; i++) {
    const digito = Number(value.charAt(i));
    // Pesos 1-indexed: posiciones impares peso 1, pares peso 3.
    const peso = (i + 1) % 2 === 0 ? 3 : 1;
    suma += digito * peso;
  }
  const checkEsperado = (10 - (suma % 10)) % 10;
  const checkRecibido = Number(value.charAt(12));
  return checkEsperado === checkRecibido;
}

// Estados de validacion mientras el usuario escribe (feedback en el UI).
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
