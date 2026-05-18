import type { OrdenCompraFragment } from '@/generated/graphql';

// Escapa un valor para CSV segun RFC 4180.
function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// BOM UTF-8 al principio para que Excel ES abra los acentos correctamente.
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

export function ordenCompraFileName(date = new Date()): string {
  const iso = date.toISOString().split('T')[0];
  return `orden-compra-stocksense-${iso}.csv`;
}

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
  URL.revokeObjectURL(url);
}
