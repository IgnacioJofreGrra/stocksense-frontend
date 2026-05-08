import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient as createWsClient } from 'graphql-ws';
import { useAuthStore } from '@/stores/authStore';

const HTTP_URL = import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:3000/graphql';
const WS_URL = import.meta.env.VITE_GRAPHQL_WS_URL ?? 'ws://localhost:3000/graphql';

/**
 * HTTP link: queries y mutations van por POST a /graphql.
 */
const httpLink = new HttpLink({ uri: HTTP_URL });

/**
 * Auth link middleware: agrega Authorization Bearer en cada request HTTP.
 * Lee el token del store en runtime, asi cuando hace refresh la siguiente
 * request usa el token nuevo automaticamente (sin recrear el client).
 */
const authLink = setContext((_op, { headers }) => {
  const token = useAuthStore.getState().accessToken;
  return {
    headers: {
      ...(headers as Record<string, string> | undefined),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

/**
 * WebSocket client para subscriptions.
 *
 * connectionParams como funcion: graphql-ws la invoca cada vez que abre
 * conexion. Asi en cada reconexion lee el token actual del store en lugar
 * de quedarse con el de la primera conexion.
 *
 * keepAlive: 10s entre pings. Sin esto, NATs y proxies cierran la WS al
 * primer minuto de inactividad.
 */
const wsClient = createWsClient({
  url: WS_URL,
  keepAlive: 10_000,
  connectionParams: () => {
    const token = useAuthStore.getState().accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

const wsLink = new GraphQLWsLink(wsClient);

/**
 * Cuando el accessToken cambia (login, refresh, logout), forzamos cerrar
 * la WS. graphql-ws reabre automaticamente y connectionParams lee el
 * nuevo token. Sin esto, una subscription iniciada con un token vencido
 * sigue intentando reconectar con el mismo.
 */
let prevToken = useAuthStore.getState().accessToken;
useAuthStore.subscribe((state) => {
  if (state.accessToken !== prevToken) {
    prevToken = state.accessToken;
    // terminate (no dispose): cierra la conexion sin marcar el client
    // como permanentemente cerrado. graphql-ws reabre solo.
    wsClient.terminate();
  }
});

/**
 * Split: subscriptions van por WS, lo demas por HTTP+auth.
 */
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

/**
 * typePolicies: configuracion de cache de Apollo.
 *
 * Productos: keyArgs incluye solo los filtros que cambian la "consulta
 * conceptual" (search, categoria, activo). NO incluimos page/limit en
 * keyArgs porque queremos que paginas distintas vivan bajo la misma
 * entrada del cache.
 *
 * merge: reemplazamos al cambiar de pagina (no acumular). Para esta app
 * el dueño quiere paginas claras, no scroll infinito. Si manana queremos
 * infinite scroll, cambiamos por una funcion que concatene `data`.
 */
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        productos: {
          keyArgs: [['query', ['search', 'categoria', 'activo']]],
          merge(_existing, incoming: unknown) {
            return incoming;
          },
        },
        movimientosProducto: {
          keyArgs: [['productId'], ['query', ['tipo', 'desde', 'hasta']]],
          merge(_existing, incoming: unknown) {
            return incoming;
          },
        },
      },
    },
  },
});

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache,
  connectToDevTools: import.meta.env.DEV,
});
