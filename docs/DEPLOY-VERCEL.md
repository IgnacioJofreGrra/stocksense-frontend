# Deploy del frontend de StockSense en Vercel

Esta guia describe como llevar el frontend (React 19 + Vite + PWA) a Vercel. Vercel maneja CI/CD propio: cada push a `main` dispara un deploy automatico. No necesita GitHub Actions del lado del frontend para el deploy (el workflow de `frontend/.github/workflows/ci.yml` solo corre tests + build como verificacion adicional).

## Indice

1. [Prerequisitos](#1-prerequisitos)
2. [Configurar el proyecto en Vercel](#2-configurar-el-proyecto-en-vercel)
3. [Variables de entorno](#3-variables-de-entorno)
4. [Primer deploy](#4-primer-deploy)
5. [Dominio custom](#5-dominio-custom)
6. [PWA y service worker](#6-pwa-y-service-worker)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Prerequisitos

- Cuenta gratuita en [vercel.com](https://vercel.com).
- Repo `stocksense-frontend` en GitHub (la cuenta de Vercel debe tener acceso).
- Backend ya deployado en AWS con dominio HTTPS (ver `DEPLOY-AWS.md`). Sin esto, el frontend levanta pero no puede consumir la API.
- `vercel.json` y `.env.production` ya commiteados.

## 2. Configurar el proyecto en Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository**.
2. Seleccionar `stocksense-frontend`. Si no aparece, autorizar Vercel desde GitHub Settings → Applications.
3. Configurar:
   - **Framework Preset:** Vite (Vercel lo detecta solo).
   - **Root Directory:** raiz del repo (`./`).
   - **Build Command:** `npm run build` (Vite + tsc).
   - **Output Directory:** `dist` (default de Vite).
   - **Install Command:** `npm ci` (mas rapido que `npm install` en CI).
   - **Node Version:** 20.x.

## 3. Variables de entorno

En **Project Settings → Environment Variables**, agregar:

| Variable | Valor | Entorno |
|---|---|---|
| `VITE_API_URL` | `https://api.stocksense.tu-dominio.com` | Production |
| `VITE_GRAPHQL_URL` | `https://api.stocksense.tu-dominio.com/graphql` | Production |
| `VITE_GRAPHQL_WS_URL` | `wss://api.stocksense.tu-dominio.com/graphql` | Production |

Reemplazar `api.stocksense.tu-dominio.com` con el subdominio real del backend en AWS.

**Importante:**
- El prefijo `VITE_` es obligatorio: solo esas variables se inyectan al bundle del cliente.
- Vercel reescribe los placeholders de `.env.production` con estos valores cuando ejecuta `npm run build`.
- Para entornos preview (PRs), agregar las mismas variables apuntando a un backend de staging si existe.

## 4. Primer deploy

Click en **Deploy**. Vercel:

1. Clona el repo.
2. Ejecuta `npm ci`.
3. Ejecuta `npm run build` con las variables de entorno.
4. Sube `dist/` a su CDN global.
5. Asigna URL: `stocksense-frontend.vercel.app` (o similar).

Tiempo total: 1-2 minutos. Logs en la pestaña **Deployments**.

**Verificar tras el deploy:**
- `https://<tu-vercel-url>` → carga la pagina de login.
- DevTools → Network: las peticiones GraphQL apuntan a `https://api.stocksense.tu-dominio.com/graphql`.
- Login funciona end-to-end.

Cada push a `main` re-deploya automaticamente. Cada PR genera un **preview deployment** con su propia URL — util para QA.

## 5. Dominio custom

1. **Project Settings → Domains → Add**.
2. Ingresar `stocksense.tu-dominio.com` (o el dominio que se quiera usar).
3. Vercel muestra los registros DNS a configurar:
   - Tipo: `CNAME`
   - Nombre: `stocksense` (o el subdominio elegido)
   - Valor: `cname.vercel-dns.com`
4. Agregar el registro en el panel del proveedor de dominio (Cloudflare, GoDaddy, etc.).
5. Esperar propagacion DNS (5-30 minutos). Vercel verifica automaticamente.
6. Vercel emite cert SSL via Let's Encrypt — sin pasos extra.

**Si se usa Cloudflare como DNS:** poner el registro CNAME en modo **DNS only** (nube gris), no proxy. El proxy de Cloudflare puede romper la conexion WebSocket de las subscriptions GraphQL.

## 6. PWA y service worker

`vite-plugin-pwa` genera `sw.js` y `manifest.webmanifest` durante el build. El `vercel.json` ya configura los headers correctos:

```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    },
    {
      "source": "/manifest.webmanifest",
      "headers": [{ "key": "Content-Type", "value": "application/manifest+json" }]
    }
  ]
}
```

Sin estos headers, el browser puede cachear el SW indefinidamente y los usuarios no veran updates hasta despues de mucho tiempo.

**Para verificar PWA en produccion:**
- Chrome DevTools → Application → Manifest: el manifest debe parsear sin errores.
- Lighthouse → PWA: score esperado > 90.
- Mobile (Android): el banner "Agregar a pantalla de inicio" debe aparecer al segundo visit.

## 7. Troubleshooting

**El build falla con `Cannot find module 'X'`.**
- Probable: el paquete esta en `devDependencies` pero el build lo necesita en runtime. Revisar `package.json` y mover a `dependencies` si corresponde.

**El build pasa pero la pagina muestra error 404.**
- Probable: el `vercel.json` tiene un `rewrites` mal configurado. Para SPA, debe redirigir todo a `/index.html` (excepto assets).
- Verificar el regex del `source` en `vercel.json`.

**Las queries GraphQL fallan con CORS.**
- Verificar que `FRONTEND_URL` esta seteado en el backend (`.env.production` de la EC2) con la URL exacta de Vercel.
- El backend rechaza requests de origenes no listados.
- Si se cambia el dominio del frontend, actualizar `FRONTEND_URL` y reiniciar el container del backend.

**WebSocket de subscriptions GraphQL no conecta (403/upgrade fallido).**
- Verificar que `VITE_GRAPHQL_WS_URL` usa `wss://` (no `ws://`) — los browsers bloquean `ws://` desde una pagina HTTPS.
- Verificar que el Nginx del backend tiene los headers `Upgrade`/`Connection` para `/graphql` (ver `DEPLOY-AWS.md` §6).
- Si esta detras de Cloudflare proxy: cambiar a DNS only (ver §5).

**El service worker queda cacheando una version vieja.**
- Forzar update: en DevTools → Application → Service Workers → **Update on reload**.
- Para usuarios reales, el SW se actualiza automaticamente al detectar un nuevo `sw.js` (hashed). El componente `OfflineBanner` muestra "actualizacion disponible" al detectar el cambio.

**Quiero rollback a un deploy anterior.**
- **Project → Deployments**, buscar el deploy bueno, click en **... → Promote to Production**. Vercel apunta el dominio al deploy anterior sin rebuilds.

**El build se queda sin memoria.**
- Vercel free tier permite hasta 8GB durante builds. Si el bundle crece mucho, dividir en chunks mas chicos (`build.rollupOptions.output.manualChunks` en `vite.config.ts`).

---

**Notas operativas:**
- Vercel free tier: 100GB bandwidth/mes, builds ilimitados, deploys ilimitados. Suficiente para un comercio de barrio.
- Los preview deploys (PRs) tambien cuentan en bandwidth pero son ideales para mostrar cambios antes de mergear.
- Si se busca analytics: Vercel Analytics (gratis hasta 2.500 events/mes) o Plausible/Umami self-hosted.
