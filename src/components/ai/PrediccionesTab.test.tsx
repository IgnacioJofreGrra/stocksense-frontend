import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { describe, expect, it } from 'vitest';
import {
  PredecirReposicionDocument,
  type PredecirReposicionQuery,
} from '@/generated/graphql';
import { PrediccionesTab } from './PrediccionesTab';

/**
 * Test integral del tab. Cubrimos:
 * - empty state inicial (CTA visible)
 * - resultados ordenados por urgencia
 * - empty state post-fetch (inventario sano)
 * - rate-limit con countdown
 *
 * Mockeamos PredecirReposicion con MockedResponse de Apollo.
 */

function fixture(urgencia: 'alta' | 'media' | 'baja', dias: number, nombre: string) {
  return {
    __typename: 'PrediccionRestockGql' as const,
    productoId: `p-${nombre}`,
    nombre,
    ean13: '7501031311309',
    stockActual: 5,
    consumoPromedioDiario: 2.5,
    diasHastaAgotamiento: dias,
    cantidadSugeridaReponer: 30,
    urgencia,
    razonamiento: `Razonamiento para ${nombre}`,
  };
}

function makeMock(
  predicciones: PredecirReposicionQuery['predecirReposicion'] = [],
): MockedResponse {
  return {
    request: { query: PredecirReposicionDocument },
    result: { data: { predecirReposicion: predicciones } },
  };
}

function renderTab(mocks: MockedResponse[]) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <PrediccionesTab />
    </MockedProvider>,
  );
}

describe('PrediccionesTab', () => {
  it('renderiza CTA inicial sin disparar la query', () => {
    renderTab([]);
    expect(screen.getByRole('button', { name: /analizar mi inventario/i })).toBeInTheDocument();
    expect(screen.queryByText(/URGENCIA/)).not.toBeInTheDocument();
  });

  it('muestra cards ordenadas por urgencia tras analizar', async () => {
    const data = [
      fixture('baja', 10, 'Producto Baja'),
      fixture('alta', 2, 'Producto Alta'),
      fixture('media', 5, 'Producto Media'),
    ];
    renderTab([makeMock(data)]);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /analizar mi inventario/i }));

    await waitFor(() => {
      expect(screen.getByText('URGENCIA ALTA')).toBeInTheDocument();
    });

    const cards = screen.getAllByText(/URGENCIA/);
    expect(cards[0]).toHaveTextContent('ALTA');
    expect(cards[1]).toHaveTextContent('MEDIA');
    expect(cards[2]).toHaveTextContent('BAJA');
  });

  it('muestra empty state cuando la IA no devuelve productos', async () => {
    renderTab([makeMock([])]);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /analizar mi inventario/i }));

    await waitFor(() => {
      expect(screen.getByText(/Tu inventario esta bien abastecido/)).toBeInTheDocument();
    });
  });

  it('muestra UX de rate-limit con countdown deshabilitando el boton', async () => {
    const errorMock: MockedResponse = {
      request: { query: PredecirReposicionDocument },
      result: {
        errors: [
          new GraphQLError('Limite de consultas de IA alcanzado. Reintentar en 30s.', {
            extensions: { code: 'TOO_MANY_REQUESTS' },
          }),
        ],
      },
    };

    renderTab([errorMock]);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /analizar mi inventario/i }));

    await waitFor(() => {
      expect(screen.getByText(/Limite de consultas alcanzado/i)).toBeInTheDocument();
    });

    // Algun control debe mostrar el countdown "Esperar Xs..."
    expect(screen.getAllByText(/Esperar \d+s/i).length).toBeGreaterThan(0);
  });
});
