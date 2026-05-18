import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { OfflineBanner } from './OfflineBanner';

describe('OfflineBanner', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { writable: true, value: true });
  });

  it('no se renderiza si online', () => {
    Object.defineProperty(navigator, 'onLine', { writable: true, value: true });
    const { container } = render(<OfflineBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('se renderiza con mensaje claro si offline', () => {
    Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
    render(<OfflineBanner />);
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByText(/sin conexion/i)).toBeInTheDocument();
  });
});
