import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  GenerarOrdenCompraDocument,
  type GenerarOrdenCompraQuery,
} from '@/generated/graphql';
import { OrdenCompraTab } from './OrdenCompraTab';

/**
 * Tests del OrdenCompraTab.
 *
 * Cubrimos:
 * - renderizado de la tabla con items
 * - calculo y display del total estimado
 * - export CSV (verificamos que se invoque con el contenido correcto)
 *
 * El export real usa Blob + ObjectURL: stubeamos ambos y verificamos el
 * contenido del Blob construido.
 */

const ordenFixture: GenerarOrdenCompraQuery['generarOrdenCompra'] = {
  __typename: 'OrdenCompraGql',
  totalEstimado: 51000,
  notas: 'Comprar antes del viernes.',
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
      nombre: 'Arroz 1kg',
      ean13: '7798021530108',
      cantidadSugerida: 20,
      precioUnitarioEstimado: 800,
      subtotalEstimado: 16000,
      prioridad: 'normal',
      motivo: 'Consumo normal',
    },
  ],
};

function makeMock(diasCobertura = 14): MockedResponse {
  return {
    request: {
      query: GenerarOrdenCompraDocument,
      variables: { diasCobertura },
    },
    result: { data: { generarOrdenCompra: ordenFixture } },
  };
}

function renderTab(mocks: MockedResponse[]) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <OrdenCompraTab />
    </MockedProvider>,
  );
}

describe('OrdenCompraTab', () => {
  it('renderiza la tabla con items luego de generar', async () => {
    renderTab([makeMock()]);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /generar orden de compra/i }));

    await waitFor(() => {
      expect(screen.getByText('Coca Cola 2.5L')).toBeInTheDocument();
    });
    expect(screen.getByText('Arroz 1kg')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('muestra total estimado formateado en pesos AR', async () => {
    renderTab([makeMock()]);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /generar orden de compra/i }));

    const total = await screen.findByTestId('total-estimado');
    // Format ARS: "$ 51.000" (con espacio o sin, depende del runtime es-AR)
    expect(total.textContent).toMatch(/51\.000/);
  });

  it('exporta CSV con los datos correctos al hacer click en exportar', async () => {
    // Stubs del DOM para el download
    const createObjectURLSpy = vi.fn().mockReturnValue('blob:fake');
    const revokeObjectURLSpy = vi.fn();
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = createObjectURLSpy;
    URL.revokeObjectURL = revokeObjectURLSpy;

    // Capturamos el Blob generado para verificar su contenido.
    const blobs: Blob[] = [];
    createObjectURLSpy.mockImplementation((b: Blob) => {
      blobs.push(b);
      return 'blob:fake';
    });

    renderTab([makeMock()]);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /generar orden de compra/i }));

    const exportButton = await screen.findByRole('button', {
      name: /exportar orden de compra/i,
    });
    await user.click(exportButton);

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(blobs).toHaveLength(1);
    expect(blobs[0].type).toContain('text/csv');

    const csvText = await blobs[0].text();
    expect(csvText).toContain('Producto,EAN-13,Cantidad');
    expect(csvText).toContain('Coca Cola 2.5L');
    expect(csvText).toContain('7501031311309');
    expect(csvText).toContain('Total Estimado');
    expect(csvText).toContain('51000');

    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });
});
