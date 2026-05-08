import { describe, expect, it } from 'vitest';
import { isValidEan13, validateEan13 } from './ean13';

/**
 * Tests del validador EAN-13 client-side.
 *
 * Replica los casos del backend (src/common/validators/ean13.validator.spec.ts)
 * para garantizar que ambos lados validan exactamente lo mismo.
 */
describe('isValidEan13', () => {
  it('acepta el EAN-13 valido de Coca Cola Mexico', () => {
    expect(isValidEan13('7501031311309')).toBe(true);
  });

  it('acepta otros EAN-13 conocidos validos', () => {
    expect(isValidEan13('5901234123457')).toBe(true);
    expect(isValidEan13('4006381333931')).toBe(true);
    expect(isValidEan13('0000000000000')).toBe(true); // edge case
  });

  it('rechaza EAN-13 con digito verificador incorrecto', () => {
    expect(isValidEan13('7501031311300')).toBe(false);
  });

  it('rechaza strings de longitud distinta a 13', () => {
    expect(isValidEan13('123456789012')).toBe(false);
    expect(isValidEan13('12345678901234')).toBe(false);
    expect(isValidEan13('')).toBe(false);
  });

  it('rechaza strings con caracteres no numericos', () => {
    expect(isValidEan13('750103131130A')).toBe(false);
    expect(isValidEan13('7501-3131-1309')).toBe(false);
  });

  it('rechaza valores que no son string', () => {
    expect(isValidEan13(undefined)).toBe(false);
    expect(isValidEan13(null)).toBe(false);
    expect(isValidEan13(7501031311309)).toBe(false);
  });
});

describe('validateEan13 (estados de validacion para UI)', () => {
  it('empty cuando es vacio', () => {
    expect(validateEan13('')).toEqual({ kind: 'empty' });
  });

  it('incomplete cuando faltan digitos', () => {
    expect(validateEan13('123')).toEqual({ kind: 'incomplete', faltantes: 10 });
  });

  it('invalid-format cuando hay no-digitos', () => {
    expect(validateEan13('abc')).toEqual({ kind: 'invalid-format' });
  });

  it('invalid-format cuando supera 13 digitos', () => {
    expect(validateEan13('12345678901234')).toEqual({ kind: 'invalid-format' });
  });

  it('invalid-checksum cuando son 13 digitos pero check digit malo', () => {
    expect(validateEan13('7501031311300')).toEqual({ kind: 'invalid-checksum' });
  });

  it('valid cuando es un EAN-13 completo y correcto', () => {
    expect(validateEan13('7501031311309')).toEqual({ kind: 'valid' });
  });
});
