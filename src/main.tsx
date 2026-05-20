import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App.tsx';
import { initSentry } from './lib/sentry';

// Init de Sentry antes del primer render para capturar errores tempranos.
initSentry();

// El SW se actualiza solo (registerType: 'autoUpdate'), sin prompt.
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={
        <div style={{ padding: 24, fontFamily: 'system-ui', textAlign: 'center' }}>
          <h2>Algo se rompio</h2>
          <p>Refrescar la pagina suele alcanzar. Si persiste, escribinos.</p>
        </div>
      }
    >
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
