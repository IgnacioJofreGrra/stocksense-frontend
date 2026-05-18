import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient as createWsClient } from 'graphql-ws';
import { useAuthStore } from '@/stores/authStore';

const HTTP_URL = import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:3000/graphql';
const WS_URL = import.meta.env.VITE_GRAPHQL_WS_URL ?? 'ws://localhost:3000/graphql';

const httpLink = new HttpLink({ uri: HTTP_URL });

// Lee el token del store en runtime: tras un refresh la proxima request
// usa el token nuevo sin recrear el client.
const authLink = setContext((_op, { headers }) => {
  const token = useAuthStore.getState().accessToken;
  return {
    headers: {
      ...(headers as Record<string, string> | undefined),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

// connectionParams como funcion: graphql-ws la invoca en cada (re)conexion,
// asi siempre lee el token actual del store. keepAlive evita que NATs y
// proxies cierren la WS por inactividad.
const wsClient = createWsClient({
  url: WS_URL,
  keepAlive: 10_000,
  connectionParams: () => {
    const token = useAuthStore.getState().accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

const wsLink = new GraphQLWsLink(wsClient);

// Al cambiar el accessToken cerramos la WS para que reabra con el token
// nuevo; sin esto una subscription sigue reconectando con uno vencido.
let prevToken = useAuthStore.getState().accessToken;
useAuthStore.subscribe((state) => {
  if (state.accessToken !== prevToken) {
    prevToken = state.accessToken;
    // terminate (no dispose): graphql-ws reabre solo.
    wsClient.terminate();
  }
});

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

// keyArgs excluye page/limit a proposito: las distintas paginas comparten
// entrada de cache. merge reemplaza (paginacion clasica, no scroll infinito).
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
