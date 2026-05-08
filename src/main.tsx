import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App.tsx';

/**
 * Registro del Service Worker (PWA).
 *
 * vite-plugin-pwa expone el modulo virtual `virtual:pwa-register`. Lo
 * llamamos al arrancar para que el navegador instale/actualice el SW.
 *
 * onNeedRefresh / onOfflineReady: callbacks opcionales para notificar
 * al usuario. Con `registerType: 'autoUpdate'` el plugin se actualiza
 * solo, asi que no mostramos prompt — silencioso es la mejor UX para
 * un dashboard que se usa mientras hay clientes en el mostrador.
 */
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
