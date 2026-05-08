# StockSense — Frontend

Frontend mobile-first del sistema de gestión de inventario StockSense. Stack: React 19 + Vite + TailwindCSS + Apollo Client + PWA.

Backend: ver [stocksense-backend](https://github.com/IgnacioJofreGrra/stocksense-backend).

## Stack

- React 19 + Vite + TypeScript strict
- TailwindCSS + shadcn/ui
- Apollo Client v3 (HTTP + WebSocket) + GraphQL Codegen
- Zustand para estado global
- React Router
- PWA con service worker (vite-plugin-pwa)
- @zxing/browser para escáner EAN-13
- Recharts para gráficos
- Vitest + Testing Library

## Quick start

```bash
git clone https://github.com/IgnacioJofreGrra/stocksense-frontend.git
cd stocksense-frontend

cp .env.local.example .env.local
# default apunta a http://localhost:3000

# Backend corriendo (otro repo): npm run docker:up + npm run start:dev

npm install
npm run dev
```

App en `http://localhost:5173`. Login con el primer usuario que registres.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Vite con HMR |
| `npm run build` | tsc + Vite build → `dist/` |
| `npm run preview` | Sirve el build en `localhost:4173` |
| `npm run codegen` | Regenera tipos desde el schema GraphQL del backend |
| `npm test` | Vitest |

## Páginas

| Ruta | Página |
|---|---|
| `/login`, `/register` | Auth |
| `/dashboard` | KPIs + alertas en vivo |
| `/productos` | CRUD productos, búsqueda, soft delete |
| `/escanear` | Cámara EAN-13 con fallback manual |
| `/inventario` | Stock, historial, gráficas |
| `/inteligencia` | Predicciones, tendencias, órdenes (solo dueños) |
| `/perfil` | Datos de cuenta + cambio de contraseña |

## Deploy

Vercel — ver [`docs/DEPLOY-VERCEL.md`](./docs/DEPLOY-VERCEL.md). Resumen: importar en Vercel, framework Vite (auto), agregar `VITE_API_URL` / `VITE_GRAPHQL_URL` / `VITE_GRAPHQL_WS_URL`, deploy.

## Notas

- Code-split por ruta — initial chunk chico, ScannerPage e InventoryPage cargan bajo demanda.
- Optimistic UI condicional — entradas siempre optimistic; salidas solo si el stock margen lo permite (cerca del mínimo esperamos respuesta del server).
- PWA con NetworkFirst para `/graphql` — datos cacheados visibles sin red, mutations fallan con toast.
- Codegen con `enumsAsConst` — los enums GraphQL se generan como `const` con keys uppercase. Cuando el escáner consulta REST la respuesta viene en lowercase; ojo al comparar.
- Cooldown del escáner 2.5s — sin esto @zxing dispara 30+ decodes/seg.
- shadcn/ui en `src/components/ui/` no se modifica a mano. Para customizar, copiar a `src/components/custom/`.
