import type { OrdenCompraFragment } from '@/generated/graphql';

/**
 * Escapa un valor para CSV: si tiene coma, comillas o salto de linea, lo
 * envuelve en comillas dobles y duplica las comillas internas (RFC 4180).
 */
function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * buildOrdenCompraCsv — arma el contenido CSV de la orden de compra.
 *
 * Aislado de la descarga para poder testearlo sin tocar el DOM.
 *
 * Encoding: BOM UTF-8 al principio para que Excel abra los acentos
 * correctamente (sin esto, "Acción" se ve como "Acci&oacute;n" en Excel ES).
 */
export function buildOrdenCompraCsv(orden: OrdenCompraFragment): string {
  const headers = [
    'Producto',
    'EAN-13',
    'Cantidad',
    'Precio Unitario',
    'Subtotal',
    'Prioridad',
    'Motivo',
  ];
  const rows = orden.items.map((item) =>
    [
      csvCell(item.nombre),
      csvCell(item.ean13),
      csvCell(item.cantidadSugerida),
      csvCell(item.precioUnitarioEstimado),
      csvCell(item.subtotalEstimado),
      csvCell(item.prioridad),
      csvCell(item.motivo),
    ].join(','),
  );

  const totalLine = ['Total Estimado', '', '', '', csvCell(orden.totalEstimado), '', ''].join(',');
  const fechaLine = ['Fecha Sugerida', '', '', '', '', '', csvCell(orden.fechaSugerida)].join(',');

  return ['﻿' + headers.join(','), ...rows, '', totalLine, fechaLine].join('\r\n');
}

/**
 * Genera nombre de archivo con la fecha actual:
 *   "orden-compra-stocksense-2026-05-08.csv"
 */
export function ordenCompraFileName(date = new Date()): string {
  const iso = date.toISOString().split('T')[0];
  return `orden-compra-stocksense-${iso}.csv`;
}

/**
 * Dispara la descarga del CSV en el browser. No retorna nada — es el
 * efecto de borde de la accion "Exportar".
 */
export function downloadOrdenCompraCsv(orden: OrdenCompraFragment): void {
  const csv = buildOrdenCompraCsv(orden);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = ordenCompraFileName();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Liberamos el ObjectURL despues de que el browser tome la descarga.
  URL.revokeObjectURL(url);
}
