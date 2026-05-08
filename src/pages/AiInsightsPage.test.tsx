import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AiInsightsPage } from './AiInsightsPage';

/**
 * Test minimo de AiInsightsPage:
 * - Renderiza los 3 tabs (al menos los triggers)
 * - Por defecto muestra la tab Predicciones (CTA "Analizar mi inventario")
 * - Al cambiar a "Tendencias" se ve el boton "Analizar tendencias"
 *
 * El comportamiento detallado de cada tab se cubre en sus tests propios.
 */
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
    // Triggers desktop (los mobile son SelectItem con el mismo label).
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
    // El TabsTrigger desktop de Tendencias.
    const trigger = screen.getByRole('tab', { name: /tendencias/i });
    await user.click(trigger);

    expect(screen.getByRole('button', { name: /analizar tendencias/i })).toBeInTheDocument();
  });
});
