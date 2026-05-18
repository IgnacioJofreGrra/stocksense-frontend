import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProductFormModal } from './ProductFormModal';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

const renderModal = (props: Partial<React.ComponentProps<typeof ProductFormModal>> = {}) =>
  render(
    <MockedProvider mocks={[]} addTypename={false}>
      <ProductFormModal
        open={true}
        onOpenChange={() => {}}
        producto={null}
        {...props}
      />
    </MockedProvider>,
  );

describe('ProductFormModal', () => {
  it('renderiza titulo "Nuevo producto" en modo crear', () => {
    renderModal();
    expect(screen.getByText(/nuevo producto/i)).toBeInTheDocument();
  });

  it('muestra "EAN-13 valido" cuando el codigo es correcto', async () => {
    renderModal();
    const user = userEvent.setup();
    const ean = screen.getByLabelText(/EAN-13/i);
    await user.type(ean, '7501031311309');
    expect(screen.getByText(/EAN-13 valido/i)).toBeInTheDocument();
  });

  it('muestra mensaje de digito verificador incorrecto', async () => {
    renderModal();
    const user = userEvent.setup();
    const ean = screen.getByLabelText(/EAN-13/i);
    await user.type(ean, '7501031311300');
    expect(screen.getByText(/digito verificador incorrecto/i)).toBeInTheDocument();
  });

  it('deshabilita el boton crear si EAN-13 es invalido', async () => {
    renderModal();
    const user = userEvent.setup();
    const ean = screen.getByLabelText(/EAN-13/i);
    await user.type(ean, '7501031311300');
    expect(screen.getByRole('button', { name: /crear/i })).toBeDisabled();
  });

  it('pre-rellena ean13 cuando viene ean13Inicial (caso scanner)', () => {
    renderModal({ ean13Inicial: '7501031311309' });
    const ean = screen.getByLabelText(/EAN-13/i) as HTMLInputElement;
    expect(ean.value).toBe('7501031311309');
  });

  it('pre-rellena nombre, categoria y descripcion desde sugerenciaOff', () => {
    renderModal({
      sugerenciaOff: {
        nombre: 'Producto OFF',
        marca: 'Marca OFF',
        categoria: 'Bebidas',
        imagenUrl: null,
      },
    });

    const nombre = screen.getByLabelText(/nombre/i) as HTMLInputElement;
    const categoria = screen.getByLabelText(/categoria/i) as HTMLInputElement;
    const descripcion = screen.getByLabelText(/descripcion/i) as HTMLTextAreaElement;

    expect(nombre.value).toBe('Producto OFF');
    expect(categoria.value).toBe('Bebidas');
    expect(descripcion.value).toBe('Marca OFF');
  });
});
