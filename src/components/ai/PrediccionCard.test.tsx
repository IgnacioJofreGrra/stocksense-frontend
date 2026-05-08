import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PrediccionRestockFragment } from '@/generated/graphql';
import { PrediccionCard } from './PrediccionCard';

const base: PrediccionRestockFragment = {
  __typename: 'PrediccionRestockGql',
  productoId: 'p-1',
  nombre: 'Coca Cola 2.5L',
  ean13: '7501031311309',
  stockActual: 5,
  consumoPromedioDiario: 2.5,
  diasHastaAgotamiento: 2,
  cantidadSugeridaReponer: 35,
  urgencia: 'alta',
  razonamiento: 'El consumo aumento un 20% esta semana.',
};

describe('PrediccionCard', () => {
  it('muestra nombre, EAN, stock y razonamiento', () => {
    render(<PrediccionCard prediccion={base} />);
    expect(screen.getByText(/Coca Cola 2.5L/)).toBeInTheDocument();
    expect(screen.getByText(/7501031311309/)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText(/El consumo aumento/)).toBeInTheDocument();
  });

  it('pinta el badge de urgencia ALTA en rojo', () => {
    render(<PrediccionCard prediccion={base} />);
    const badge = screen.getByText('URGENCIA ALTA');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toMatch(/red/);
  });

  it('pinta el badge de urgencia MEDIA en ambar', () => {
    render(<PrediccionCard prediccion={{ ...base, urgencia: 'media' }} />);
    const badge = screen.getByText('URGENCIA MEDIA');
    expect(badge.className).toMatch(/amber/);
  });

  it('pinta el badge de urgencia BAJA en verde', () => {
    render(<PrediccionCard prediccion={{ ...base, urgencia: 'baja' }} />);
    const badge = screen.getByText('URGENCIA BAJA');
    expect(badge.className).toMatch(/emerald/);
  });

  it('normaliza variantes de la string de urgencia (mayusculas, "urgente")', () => {
    render(<PrediccionCard prediccion={{ ...base, urgencia: 'URGENTE' }} />);
    expect(screen.getByText('URGENCIA ALTA')).toBeInTheDocument();
  });

  it('formatea consumo a un decimal y dias con prefijo "~"', () => {
    render(
      <PrediccionCard
        prediccion={{ ...base, consumoPromedioDiario: 2.567, diasHastaAgotamiento: 7 }}
      />,
    );
    expect(screen.getByText('2.6 u/dia')).toBeInTheDocument();
    expect(screen.getByText('~7 dias')).toBeInTheDocument();
  });
});
