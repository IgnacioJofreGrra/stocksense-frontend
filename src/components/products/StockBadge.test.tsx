import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StockBadge } from './StockBadge';

describe('StockBadge', () => {
  it('muestra "Sin stock" cuando stockActual <= 0', () => {
    render(<StockBadge stockActual={0} stockMinimo={5} />);
    expect(screen.getByText(/sin stock/i)).toBeInTheDocument();
  });

  it('muestra valor con minimo cuando esta bajo el minimo (rojo)', () => {
    render(<StockBadge stockActual={3} stockMinimo={5} />);
    expect(screen.getByText('3 / min 5')).toBeInTheDocument();
  });

  it('muestra solo el numero cuando esta arriba del minimo', () => {
    render(<StockBadge stockActual={20} stockMinimo={5} />);
    expect(screen.getByText('20')).toBeInTheDocument();
  });
});
