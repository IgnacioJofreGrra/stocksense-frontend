import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AiInsightsPage } from './AiInsightsPage';

function renderPage() {
  return render(
    <MockedProvider mocks={[]} addTypename={false}>
      <AiInsightsPage />
    </MockedProvider>,
  );
}

describe('AiInsightsPage', () => {
  it('renderiza titulo y los 3 tabs', () => {
    renderPage();
    expect(screen.getByText(/inteligencia del negocio/i)).toBeInTheDocument();
    expect(screen.getAllByText(/predicciones/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/tendencias/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/orden de compra/i).length).toBeGreaterThan(0);
  });

  it('por defecto la tab activa es Predicciones', () => {
    renderPage();
    expect(
      screen.getByRole('button', { name: /analizar mi inventario/i }),
    ).toBeInTheDocument();
  });

  it('al cambiar a Tendencias se ve el boton de analizar tendencias', async () => {
    renderPage();
    const user = userEvent.setup();
    const trigger = screen.getByRole('tab', { name: /tendencias/i });
    await user.click(trigger);

    expect(screen.getByRole('button', { name: /analizar tendencias/i })).toBeInTheDocument();
  });
});
