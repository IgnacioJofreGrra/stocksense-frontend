import { describe, expect, it } from 'vitest';
import type { OrdenCompraFragment } from '@/generated/graphql';
import { buildOrdenCompraCsv, ordenCompraFileName } from './ai-export';

/**
 * Tests del export de orden de compra a CSV. Solo testeamos la funcion
 * pura (sin tocar Blob/document) — la descarga real es una capa fina y
 * la cubrimos en el test del componente OrdenCompraTab.
 */

const ordenFixture: OrdenCompraFragment = {
  __typename: 'OrdenCompraGql',
  totalEstimado: 51000,
  notas: 'Comprar antes del viernes para evitar rotura de stock.',
  fechaSugerida: '2026-05-10',
  items: [
    {
      __typename: 'ItemOrdenGql',
      productoId: 'p-1',
      nombre: 'Coca Cola 2.5L',
      ean13: '7501031311309',
      cantidadSugerida: 35,
      precioUnitarioEstimado: 1000,
      subtotalEstimado: 35000,
      prioridad: 'urgente',
      motivo: 'Stock bajo minimo',
    },
    {
      __typename: 'ItemOrdenGql',
      productoId: 'p-2',
      nombre: 'Arroz, 1kg',
      ean13: '7798021530108',
      cantidadSugerida: 20,
      precioUnitarioEstimado: 800,
      subtotalEstimado: 16000,
      prioridad: 'normal',
      motivo: 'Consumo "normal"',
    },
  ],
};

describe('buildOrdenCompraCsv', () => {
  it('contiene los headers en castellano', () => {
    const csv = buildOrdenCompraCsv(ordenFixture);
    expect(csv).toContain('Producto,EAN-13,Cantidad,Precio Unitario,Subtotal,Prioridad,Motivo');
  });

  it('incluye una fila por item con los valores correctos', () => {
    const csv = buildOrdenCompraCsv(ordenFixture);
    expect(csv).toContain('Coca Cola 2.5L');
    expect(csv).toContain('7501031311309');
    expect(csv).toContain('35');
    expect(csv).toContain('1000');
    expect(csv).toContain('35000');
    expect(csv).toContain('urgente');
  });

  it('escapa comillas y comas en valores con caracteres especiales', () => {
    const csv = buildOrdenCompraCsv(ordenFixture);
    // "Arroz, 1kg" tiene una coma -> debe ir entre comillas dobles.
    expect(csv).toContain('"Arroz, 1kg"');
    // 'Consumo "normal"' tiene comillas internas -> deben duplicarse.
    expect(csv).toContain('"Consumo ""normal"""');
  });

  it('agrega total estimado y fecha sugerida al final', () => {
    const csv = buildOrdenCompraCsv(ordenFixture);
    expect(csv).toContain('Total Estimado');
    expect(csv).toContain('51000');
    expect(csv).toContain('Fecha Sugerida');
    expect(csv).toContain('2026-05-10');
  });

  it('arranca con BOM UTF-8 para abrirse correctamente en Excel', () => {
    const csv = buildOrdenCompraCsv(ordenFixture);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });
});

describe('ordenCompraFileName', () => {
  it('incluye prefijo del producto y la fecha en formato ISO', () => {
    const name = ordenCompraFileName(new Date('2026-05-08T12:00:00Z'));
    expect(name).toBe('orden-compra-stocksense-2026-05-08.csv');
  });
});
