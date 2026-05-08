import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type AlertaStock = {
  __typename?: 'AlertaStock';
  diferencia: Scalars['Int']['output'];
  producto: Product;
  stockActual: Scalars['Int']['output'];
  stockMinimo: Scalars['Int']['output'];
};

export type AnalisisTendenciasGql = {
  __typename?: 'AnalisisTendenciasGql';
  patronesDiarios: Array<PatronDiarioGql>;
  patronesHorarios: Array<PatronHorarioGql>;
  productosDestacados: Array<ProductoDestacadoGql>;
  recomendaciones: Array<Scalars['String']['output']>;
  resumenGeneral: Scalars['String']['output'];
};

export type CreateProductInput = {
  categoria?: InputMaybe<Scalars['String']['input']>;
  descripcion?: InputMaybe<Scalars['String']['input']>;
  ean13: Scalars['String']['input'];
  imagenUrl?: InputMaybe<Scalars['String']['input']>;
  nombre: Scalars['String']['input'];
  precioCompra?: InputMaybe<Scalars['Float']['input']>;
  precioVenta?: InputMaybe<Scalars['Float']['input']>;
  stockMinimo?: InputMaybe<Scalars['Int']['input']>;
  unidadMedida?: InputMaybe<Scalars['String']['input']>;
};

export type DateRangeInput = {
  desde?: InputMaybe<Scalars['String']['input']>;
  hasta?: InputMaybe<Scalars['String']['input']>;
  limite?: InputMaybe<Scalars['Int']['input']>;
};

export type ItemOrdenGql = {
  __typename?: 'ItemOrdenGql';
  cantidadSugerida: Scalars['Int']['output'];
  ean13: Scalars['String']['output'];
  motivo: Scalars['String']['output'];
  nombre: Scalars['String']['output'];
  precioUnitarioEstimado?: Maybe<Scalars['Float']['output']>;
  prioridad: Scalars['String']['output'];
  productoId: Scalars['ID']['output'];
  subtotalEstimado?: Maybe<Scalars['Float']['output']>;
};

export type MovimientoConStock = {
  __typename?: 'MovimientoConStock';
  movimiento: StockMovement;
  stockActual: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  actualizarProducto: Product;
  crearProducto: Product;
  desactivarProducto: Scalars['Boolean']['output'];
  registrarAjuste: MovimientoConStock;
  registrarEntrada: MovimientoConStock;
  registrarSalida: MovimientoConStock;
};


export type MutationActualizarProductoArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProductInput;
};


export type MutationCrearProductoArgs = {
  input: CreateProductInput;
};


export type MutationDesactivarProductoArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRegistrarAjusteArgs = {
  input: RegistrarAjusteInput;
};


export type MutationRegistrarEntradaArgs = {
  input: RegistrarEntradaInput;
};


export type MutationRegistrarSalidaArgs = {
  input: RegistrarSalidaInput;
};

export type OrdenCompraGql = {
  __typename?: 'OrdenCompraGql';
  fechaSugerida: Scalars['String']['output'];
  items: Array<ItemOrdenGql>;
  notas: Scalars['String']['output'];
  totalEstimado?: Maybe<Scalars['Float']['output']>;
};

export type PaginatedMovimientos = {
  __typename?: 'PaginatedMovimientos';
  data: Array<StockMovement>;
  lastPage: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PaginatedProducts = {
  __typename?: 'PaginatedProducts';
  data: Array<Product>;
  lastPage: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PatronDiarioGql = {
  __typename?: 'PatronDiarioGql';
  dia: Scalars['String']['output'];
  insight: Scalars['String']['output'];
  relevancia: Scalars['String']['output'];
};

export type PatronHorarioGql = {
  __typename?: 'PatronHorarioGql';
  franja: Scalars['String']['output'];
  insight: Scalars['String']['output'];
};

export type PrediccionRestockGql = {
  __typename?: 'PrediccionRestockGql';
  cantidadSugeridaReponer: Scalars['Int']['output'];
  consumoPromedioDiario: Scalars['Float']['output'];
  diasHastaAgotamiento: Scalars['Int']['output'];
  ean13: Scalars['String']['output'];
  nombre: Scalars['String']['output'];
  productoId: Scalars['ID']['output'];
  razonamiento: Scalars['String']['output'];
  stockActual: Scalars['Int']['output'];
  urgencia: Scalars['String']['output'];
};

export type Product = {
  __typename?: 'Product';
  activo: Scalars['Boolean']['output'];
  categoria?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  descripcion?: Maybe<Scalars['String']['output']>;
  ean13: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  imagenUrl?: Maybe<Scalars['String']['output']>;
  nombre: Scalars['String']['output'];
  precioCompra?: Maybe<Scalars['Float']['output']>;
  precioVenta?: Maybe<Scalars['Float']['output']>;
  stockActual: Scalars['Int']['output'];
  stockMinimo: Scalars['Int']['output'];
  unidadMedida: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export const ProductOrderBy = {
  CreatedAt: 'CREATED_AT',
  Nombre: 'NOMBRE',
  PrecioVenta: 'PRECIO_VENTA'
} as const;

export type ProductOrderBy = typeof ProductOrderBy[keyof typeof ProductOrderBy];
export type ProductoDestacadoGql = {
  __typename?: 'ProductoDestacadoGql';
  nombre: Scalars['String']['output'];
  patron: Scalars['String']['output'];
};

export type ProductoMasVendido = {
  __typename?: 'ProductoMasVendido';
  cantidadMovimientos: Scalars['Int']['output'];
  ean13: Scalars['String']['output'];
  nombreProducto: Scalars['String']['output'];
  productoId: Scalars['ID']['output'];
  totalVendido: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  alertasStock: Array<AlertaStock>;
  analizarTendencias: AnalisisTendenciasGql;
  generarOrdenCompra: OrdenCompraGql;
  movimientosProducto: PaginatedMovimientos;
  predecirReposicion: Array<PrediccionRestockGql>;
  producto?: Maybe<Product>;
  productoPorEan?: Maybe<Product>;
  productos: PaginatedProducts;
  productosMasVendidos: Array<ProductoMasVendido>;
  resumenPeriodo: ResumenPeriodo;
  stockProducto: StockInfo;
  tendenciaProducto: Array<TendenciaPunto>;
  ventasPorDia: Array<VentasPorDia>;
  ventasPorHora: Array<VentasPorHora>;
};


export type QueryAnalizarTendenciasArgs = {
  opciones?: InputMaybe<DateRangeInput>;
};


export type QueryGenerarOrdenCompraArgs = {
  diasCobertura?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMovimientosProductoArgs = {
  productId: Scalars['ID']['input'];
  query?: InputMaybe<QueryMovimientosInput>;
};


export type QueryProductoArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductoPorEanArgs = {
  ean13: Scalars['String']['input'];
};


export type QueryProductosArgs = {
  query?: InputMaybe<QueryProductsInput>;
};


export type QueryProductosMasVendidosArgs = {
  opciones?: InputMaybe<DateRangeInput>;
};


export type QueryResumenPeriodoArgs = {
  opciones?: InputMaybe<DateRangeInput>;
};


export type QueryStockProductoArgs = {
  productId: Scalars['ID']['input'];
};


export type QueryTendenciaProductoArgs = {
  opciones?: InputMaybe<DateRangeInput>;
  productoId: Scalars['ID']['input'];
};


export type QueryVentasPorDiaArgs = {
  opciones?: InputMaybe<DateRangeInput>;
};


export type QueryVentasPorHoraArgs = {
  opciones?: InputMaybe<DateRangeInput>;
};

export type QueryMovimientosInput = {
  desde?: InputMaybe<Scalars['String']['input']>;
  hasta?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
  tipo?: InputMaybe<StockMovementType>;
};

export type QueryProductsInput = {
  activo?: InputMaybe<Scalars['Boolean']['input']>;
  categoria?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  order?: InputMaybe<SortOrder>;
  orderBy?: InputMaybe<ProductOrderBy>;
  page?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};

export type RegistrarAjusteInput = {
  cantidad: Scalars['Int']['input'];
  motivo: Scalars['String']['input'];
  nota?: InputMaybe<Scalars['String']['input']>;
  productId: Scalars['ID']['input'];
};

export type RegistrarEntradaInput = {
  cantidad: Scalars['Int']['input'];
  motivo?: InputMaybe<Scalars['String']['input']>;
  nota?: InputMaybe<Scalars['String']['input']>;
  productId: Scalars['ID']['input'];
};

export type RegistrarSalidaInput = {
  cantidad: Scalars['Int']['input'];
  motivo?: InputMaybe<Scalars['String']['input']>;
  nota?: InputMaybe<Scalars['String']['input']>;
  productId: Scalars['ID']['input'];
};

export type ResumenPeriodo = {
  __typename?: 'ResumenPeriodo';
  movimientosTotales: Scalars['Int']['output'];
  productosUnicos: Scalars['Int']['output'];
  promedioDiarioVentas: Scalars['Float']['output'];
  totalEntradas: Scalars['Int']['output'];
  totalSalidas: Scalars['Int']['output'];
};

export const SortOrder = {
  Asc: 'ASC',
  Desc: 'DESC'
} as const;

export type SortOrder = typeof SortOrder[keyof typeof SortOrder];
export type StockInfo = {
  __typename?: 'StockInfo';
  productId: Scalars['ID']['output'];
  stockActual: Scalars['Int']['output'];
  ultimoMovimiento?: Maybe<Scalars['DateTime']['output']>;
};

export type StockMovement = {
  __typename?: 'StockMovement';
  cantidad: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  motivo?: Maybe<Scalars['String']['output']>;
  nota?: Maybe<Scalars['String']['output']>;
  productId: Scalars['ID']['output'];
  tipo: StockMovementType;
  userId: Scalars['ID']['output'];
};

/** Tipo de movimiento de stock: entrada, salida o ajuste */
export const StockMovementType = {
  Ajuste: 'AJUSTE',
  Entrada: 'ENTRADA',
  Salida: 'SALIDA'
} as const;

export type StockMovementType = typeof StockMovementType[keyof typeof StockMovementType];
export type Subscription = {
  __typename?: 'Subscription';
  /** Se dispara al hacer una salida que deja stock <= stockMinimo */
  alertaStockBajo: AlertaStock;
};

export type TendenciaPunto = {
  __typename?: 'TendenciaPunto';
  cantidadTotal: Scalars['Int']['output'];
  periodo: Scalars['String']['output'];
  totalMovimientos: Scalars['Int']['output'];
};

export type UpdateProductInput = {
  categoria?: InputMaybe<Scalars['String']['input']>;
  descripcion?: InputMaybe<Scalars['String']['input']>;
  ean13?: InputMaybe<Scalars['String']['input']>;
  imagenUrl?: InputMaybe<Scalars['String']['input']>;
  nombre?: InputMaybe<Scalars['String']['input']>;
  precioCompra?: InputMaybe<Scalars['Float']['input']>;
  precioVenta?: InputMaybe<Scalars['Float']['input']>;
  stockMinimo?: InputMaybe<Scalars['Int']['input']>;
  unidadMedida?: InputMaybe<Scalars['String']['input']>;
};

export type VentasPorDia = {
  __typename?: 'VentasPorDia';
  diaSemana: Scalars['Int']['output'];
  nombreDia: Scalars['String']['output'];
  totalVentas: Scalars['Int']['output'];
};

export type VentasPorHora = {
  __typename?: 'VentasPorHora';
  hora: Scalars['Int']['output'];
  totalVentas: Scalars['Int']['output'];
};

export type PrediccionRestockFragment = { __typename?: 'PrediccionRestockGql', productoId: string, nombre: string, ean13: string, stockActual: number, consumoPromedioDiario: number, diasHastaAgotamiento: number, cantidadSugeridaReponer: number, urgencia: string, razonamiento: string };

export type AnalisisTendenciasFragment = { __typename?: 'AnalisisTendenciasGql', recomendaciones: Array<string>, resumenGeneral: string, patronesDiarios: Array<{ __typename?: 'PatronDiarioGql', dia: string, insight: string, relevancia: string }>, patronesHorarios: Array<{ __typename?: 'PatronHorarioGql', franja: string, insight: string }>, productosDestacados: Array<{ __typename?: 'ProductoDestacadoGql', nombre: string, patron: string }> };

export type ItemOrdenFragment = { __typename?: 'ItemOrdenGql', productoId: string, nombre: string, ean13: string, cantidadSugerida: number, precioUnitarioEstimado?: number | null, subtotalEstimado?: number | null, prioridad: string, motivo: string };

export type OrdenCompraFragment = { __typename?: 'OrdenCompraGql', totalEstimado?: number | null, notas: string, fechaSugerida: string, items: Array<{ __typename?: 'ItemOrdenGql', productoId: string, nombre: string, ean13: string, cantidadSugerida: number, precioUnitarioEstimado?: number | null, subtotalEstimado?: number | null, prioridad: string, motivo: string }> };

export type PredecirReposicionQueryVariables = Exact<{ [key: string]: never; }>;


export type PredecirReposicionQuery = { __typename?: 'Query', predecirReposicion: Array<{ __typename?: 'PrediccionRestockGql', productoId: string, nombre: string, ean13: string, stockActual: number, consumoPromedioDiario: number, diasHastaAgotamiento: number, cantidadSugeridaReponer: number, urgencia: string, razonamiento: string }> };

export type AnalizarTendenciasQueryVariables = Exact<{
  opciones?: InputMaybe<DateRangeInput>;
}>;


export type AnalizarTendenciasQuery = { __typename?: 'Query', analizarTendencias: { __typename?: 'AnalisisTendenciasGql', recomendaciones: Array<string>, resumenGeneral: string, patronesDiarios: Array<{ __typename?: 'PatronDiarioGql', dia: string, insight: string, relevancia: string }>, patronesHorarios: Array<{ __typename?: 'PatronHorarioGql', franja: string, insight: string }>, productosDestacados: Array<{ __typename?: 'ProductoDestacadoGql', nombre: string, patron: string }> } };

export type GenerarOrdenCompraQueryVariables = Exact<{
  diasCobertura?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GenerarOrdenCompraQuery = { __typename?: 'Query', generarOrdenCompra: { __typename?: 'OrdenCompraGql', totalEstimado?: number | null, notas: string, fechaSugerida: string, items: Array<{ __typename?: 'ItemOrdenGql', productoId: string, nombre: string, ean13: string, cantidadSugerida: number, precioUnitarioEstimado?: number | null, subtotalEstimado?: number | null, prioridad: string, motivo: string }> } };

export type ResumenPeriodoQueryVariables = Exact<{
  opciones?: InputMaybe<DateRangeInput>;
}>;


export type ResumenPeriodoQuery = { __typename?: 'Query', resumenPeriodo: { __typename?: 'ResumenPeriodo', totalEntradas: number, totalSalidas: number, productosUnicos: number, movimientosTotales: number, promedioDiarioVentas: number } };

export type ProductosMasVendidosQueryVariables = Exact<{
  opciones?: InputMaybe<DateRangeInput>;
}>;


export type ProductosMasVendidosQuery = { __typename?: 'Query', productosMasVendidos: Array<{ __typename?: 'ProductoMasVendido', productoId: string, ean13: string, nombreProducto: string, totalVendido: number, cantidadMovimientos: number }> };

export type MovimientoFullFragment = { __typename?: 'StockMovement', id: string, tipo: StockMovementType, cantidad: number, motivo?: string | null, nota?: string | null, productId: string, createdAt: any };

export type RegistrarEntradaMutationVariables = Exact<{
  input: RegistrarEntradaInput;
}>;


export type RegistrarEntradaMutation = { __typename?: 'Mutation', registrarEntrada: { __typename?: 'MovimientoConStock', stockActual: number, movimiento: { __typename?: 'StockMovement', id: string, tipo: StockMovementType, cantidad: number, motivo?: string | null, nota?: string | null, productId: string, createdAt: any } } };

export type RegistrarSalidaMutationVariables = Exact<{
  input: RegistrarSalidaInput;
}>;


export type RegistrarSalidaMutation = { __typename?: 'Mutation', registrarSalida: { __typename?: 'MovimientoConStock', stockActual: number, movimiento: { __typename?: 'StockMovement', id: string, tipo: StockMovementType, cantidad: number, motivo?: string | null, nota?: string | null, productId: string, createdAt: any } } };

export type StockProductoQueryVariables = Exact<{
  productId: Scalars['ID']['input'];
}>;


export type StockProductoQuery = { __typename?: 'Query', stockProducto: { __typename?: 'StockInfo', productId: string, stockActual: number, ultimoMovimiento?: any | null } };

export type MovimientosProductoQueryVariables = Exact<{
  productId: Scalars['ID']['input'];
  query?: InputMaybe<QueryMovimientosInput>;
}>;


export type MovimientosProductoQuery = { __typename?: 'Query', movimientosProducto: { __typename?: 'PaginatedMovimientos', total: number, page: number, lastPage: number, data: Array<{ __typename?: 'StockMovement', id: string, tipo: StockMovementType, cantidad: number, motivo?: string | null, nota?: string | null, productId: string, createdAt: any }> } };

export type AlertasStockQueryVariables = Exact<{ [key: string]: never; }>;


export type AlertasStockQuery = { __typename?: 'Query', alertasStock: Array<{ __typename?: 'AlertaStock', stockActual: number, stockMinimo: number, diferencia: number, producto: { __typename?: 'Product', id: string, nombre: string, ean13: string } }> };

export type AlertaStockBajoSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type AlertaStockBajoSubscription = { __typename?: 'Subscription', alertaStockBajo: { __typename?: 'AlertaStock', stockActual: number, stockMinimo: number, diferencia: number, producto: { __typename?: 'Product', id: string, nombre: string, ean13: string } } };

export type ProductoFullFragment = { __typename?: 'Product', id: string, ean13: string, nombre: string, descripcion?: string | null, categoria?: string | null, precioCompra?: number | null, precioVenta?: number | null, unidadMedida: string, stockMinimo: number, stockActual: number, activo: boolean };

export type ProductosQueryVariables = Exact<{
  query?: InputMaybe<QueryProductsInput>;
}>;


export type ProductosQuery = { __typename?: 'Query', productos: { __typename?: 'PaginatedProducts', total: number, page: number, lastPage: number, data: Array<{ __typename?: 'Product', id: string, ean13: string, nombre: string, descripcion?: string | null, categoria?: string | null, precioCompra?: number | null, precioVenta?: number | null, unidadMedida: string, stockMinimo: number, stockActual: number, activo: boolean }> } };

export type ProductoPorEanQueryVariables = Exact<{
  ean13: Scalars['String']['input'];
}>;


export type ProductoPorEanQuery = { __typename?: 'Query', productoPorEan?: { __typename?: 'Product', id: string, ean13: string, nombre: string, descripcion?: string | null, categoria?: string | null, precioCompra?: number | null, precioVenta?: number | null, unidadMedida: string, stockMinimo: number, stockActual: number, activo: boolean } | null };

export type CrearProductoMutationVariables = Exact<{
  input: CreateProductInput;
}>;


export type CrearProductoMutation = { __typename?: 'Mutation', crearProducto: { __typename?: 'Product', id: string, ean13: string, nombre: string, descripcion?: string | null, categoria?: string | null, precioCompra?: number | null, precioVenta?: number | null, unidadMedida: string, stockMinimo: number, stockActual: number, activo: boolean } };

export type ActualizarProductoMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateProductInput;
}>;


export type ActualizarProductoMutation = { __typename?: 'Mutation', actualizarProducto: { __typename?: 'Product', id: string, ean13: string, nombre: string, descripcion?: string | null, categoria?: string | null, precioCompra?: number | null, precioVenta?: number | null, unidadMedida: string, stockMinimo: number, stockActual: number, activo: boolean } };

export type DesactivarProductoMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DesactivarProductoMutation = { __typename?: 'Mutation', desactivarProducto: boolean };

export const PrediccionRestockFragmentDoc = gql`
    fragment PrediccionRestock on PrediccionRestockGql {
  productoId
  nombre
  ean13
  stockActual
  consumoPromedioDiario
  diasHastaAgotamiento
  cantidadSugeridaReponer
  urgencia
  razonamiento
}
    `;
export const AnalisisTendenciasFragmentDoc = gql`
    fragment AnalisisTendencias on AnalisisTendenciasGql {
  patronesDiarios {
    dia
    insight
    relevancia
  }
  patronesHorarios {
    franja
    insight
  }
  productosDestacados {
    nombre
    patron
  }
  recomendaciones
  resumenGeneral
}
    `;
export const ItemOrdenFragmentDoc = gql`
    fragment ItemOrden on ItemOrdenGql {
  productoId
  nombre
  ean13
  cantidadSugerida
  precioUnitarioEstimado
  subtotalEstimado
  prioridad
  motivo
}
    `;
export const OrdenCompraFragmentDoc = gql`
    fragment OrdenCompra on OrdenCompraGql {
  items {
    ...ItemOrden
  }
  totalEstimado
  notas
  fechaSugerida
}
    ${ItemOrdenFragmentDoc}`;
export const MovimientoFullFragmentDoc = gql`
    fragment MovimientoFull on StockMovement {
  id
  tipo
  cantidad
  motivo
  nota
  productId
  createdAt
}
    `;
export const ProductoFullFragmentDoc = gql`
    fragment ProductoFull on Product {
  id
  ean13
  nombre
  descripcion
  categoria
  precioCompra
  precioVenta
  unidadMedida
  stockMinimo
  stockActual
  activo
}
    `;
export const PredecirReposicionDocument = gql`
    query PredecirReposicion {
  predecirReposicion {
    ...PrediccionRestock
  }
}
    ${PrediccionRestockFragmentDoc}`;

/**
 * __usePredecirReposicionQuery__
 *
 * To run a query within a React component, call `usePredecirReposicionQuery` and pass it any options that fit your needs.
 * When your component renders, `usePredecirReposicionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePredecirReposicionQuery({
 *   variables: {
 *   },
 * });
 */
export function usePredecirReposicionQuery(baseOptions?: Apollo.QueryHookOptions<PredecirReposicionQuery, PredecirReposicionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PredecirReposicionQuery, PredecirReposicionQueryVariables>(PredecirReposicionDocument, options);
      }
export function usePredecirReposicionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PredecirReposicionQuery, PredecirReposicionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PredecirReposicionQuery, PredecirReposicionQueryVariables>(PredecirReposicionDocument, options);
        }
// @ts-ignore
export function usePredecirReposicionSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<PredecirReposicionQuery, PredecirReposicionQueryVariables>): Apollo.UseSuspenseQueryResult<PredecirReposicionQuery, PredecirReposicionQueryVariables>;
export function usePredecirReposicionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PredecirReposicionQuery, PredecirReposicionQueryVariables>): Apollo.UseSuspenseQueryResult<PredecirReposicionQuery | undefined, PredecirReposicionQueryVariables>;
export function usePredecirReposicionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PredecirReposicionQuery, PredecirReposicionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PredecirReposicionQuery, PredecirReposicionQueryVariables>(PredecirReposicionDocument, options);
        }
export type PredecirReposicionQueryHookResult = ReturnType<typeof usePredecirReposicionQuery>;
export type PredecirReposicionLazyQueryHookResult = ReturnType<typeof usePredecirReposicionLazyQuery>;
export type PredecirReposicionSuspenseQueryHookResult = ReturnType<typeof usePredecirReposicionSuspenseQuery>;
export type PredecirReposicionQueryResult = Apollo.QueryResult<PredecirReposicionQuery, PredecirReposicionQueryVariables>;
export const AnalizarTendenciasDocument = gql`
    query AnalizarTendencias($opciones: DateRangeInput) {
  analizarTendencias(opciones: $opciones) {
    ...AnalisisTendencias
  }
}
    ${AnalisisTendenciasFragmentDoc}`;

/**
 * __useAnalizarTendenciasQuery__
 *
 * To run a query within a React component, call `useAnalizarTendenciasQuery` and pass it any options that fit your needs.
 * When your component renders, `useAnalizarTendenciasQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAnalizarTendenciasQuery({
 *   variables: {
 *      opciones: // value for 'opciones'
 *   },
 * });
 */
export function useAnalizarTendenciasQuery(baseOptions?: Apollo.QueryHookOptions<AnalizarTendenciasQuery, AnalizarTendenciasQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AnalizarTendenciasQuery, AnalizarTendenciasQueryVariables>(AnalizarTendenciasDocument, options);
      }
export function useAnalizarTendenciasLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AnalizarTendenciasQuery, AnalizarTendenciasQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AnalizarTendenciasQuery, AnalizarTendenciasQueryVariables>(AnalizarTendenciasDocument, options);
        }
// @ts-ignore
export function useAnalizarTendenciasSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AnalizarTendenciasQuery, AnalizarTendenciasQueryVariables>): Apollo.UseSuspenseQueryResult<AnalizarTendenciasQuery, AnalizarTendenciasQueryVariables>;
export function useAnalizarTendenciasSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AnalizarTendenciasQuery, AnalizarTendenciasQueryVariables>): Apollo.UseSuspenseQueryResult<AnalizarTendenciasQuery | undefined, AnalizarTendenciasQueryVariables>;
export function useAnalizarTendenciasSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AnalizarTendenciasQuery, AnalizarTendenciasQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AnalizarTendenciasQuery, AnalizarTendenciasQueryVariables>(AnalizarTendenciasDocument, options);
        }
export type AnalizarTendenciasQueryHookResult = ReturnType<typeof useAnalizarTendenciasQuery>;
export type AnalizarTendenciasLazyQueryHookResult = ReturnType<typeof useAnalizarTendenciasLazyQuery>;
export type AnalizarTendenciasSuspenseQueryHookResult = ReturnType<typeof useAnalizarTendenciasSuspenseQuery>;
export type AnalizarTendenciasQueryResult = Apollo.QueryResult<AnalizarTendenciasQuery, AnalizarTendenciasQueryVariables>;
export const GenerarOrdenCompraDocument = gql`
    query GenerarOrdenCompra($diasCobertura: Int) {
  generarOrdenCompra(diasCobertura: $diasCobertura) {
    ...OrdenCompra
  }
}
    ${OrdenCompraFragmentDoc}`;

/**
 * __useGenerarOrdenCompraQuery__
 *
 * To run a query within a React component, call `useGenerarOrdenCompraQuery` and pass it any options that fit your needs.
 * When your component renders, `useGenerarOrdenCompraQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGenerarOrdenCompraQuery({
 *   variables: {
 *      diasCobertura: // value for 'diasCobertura'
 *   },
 * });
 */
export function useGenerarOrdenCompraQuery(baseOptions?: Apollo.QueryHookOptions<GenerarOrdenCompraQuery, GenerarOrdenCompraQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GenerarOrdenCompraQuery, GenerarOrdenCompraQueryVariables>(GenerarOrdenCompraDocument, options);
      }
export function useGenerarOrdenCompraLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GenerarOrdenCompraQuery, GenerarOrdenCompraQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GenerarOrdenCompraQuery, GenerarOrdenCompraQueryVariables>(GenerarOrdenCompraDocument, options);
        }
// @ts-ignore
export function useGenerarOrdenCompraSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GenerarOrdenCompraQuery, GenerarOrdenCompraQueryVariables>): Apollo.UseSuspenseQueryResult<GenerarOrdenCompraQuery, GenerarOrdenCompraQueryVariables>;
export function useGenerarOrdenCompraSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GenerarOrdenCompraQuery, GenerarOrdenCompraQueryVariables>): Apollo.UseSuspenseQueryResult<GenerarOrdenCompraQuery | undefined, GenerarOrdenCompraQueryVariables>;
export function useGenerarOrdenCompraSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GenerarOrdenCompraQuery, GenerarOrdenCompraQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GenerarOrdenCompraQuery, GenerarOrdenCompraQueryVariables>(GenerarOrdenCompraDocument, options);
        }
export type GenerarOrdenCompraQueryHookResult = ReturnType<typeof useGenerarOrdenCompraQuery>;
export type GenerarOrdenCompraLazyQueryHookResult = ReturnType<typeof useGenerarOrdenCompraLazyQuery>;
export type GenerarOrdenCompraSuspenseQueryHookResult = ReturnType<typeof useGenerarOrdenCompraSuspenseQuery>;
export type GenerarOrdenCompraQueryResult = Apollo.QueryResult<GenerarOrdenCompraQuery, GenerarOrdenCompraQueryVariables>;
export const ResumenPeriodoDocument = gql`
    query ResumenPeriodo($opciones: DateRangeInput) {
  resumenPeriodo(opciones: $opciones) {
    totalEntradas
    totalSalidas
    productosUnicos
    movimientosTotales
    promedioDiarioVentas
  }
}
    `;

/**
 * __useResumenPeriodoQuery__
 *
 * To run a query within a React component, call `useResumenPeriodoQuery` and pass it any options that fit your needs.
 * When your component renders, `useResumenPeriodoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useResumenPeriodoQuery({
 *   variables: {
 *      opciones: // value for 'opciones'
 *   },
 * });
 */
export function useResumenPeriodoQuery(baseOptions?: Apollo.QueryHookOptions<ResumenPeriodoQuery, ResumenPeriodoQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ResumenPeriodoQuery, ResumenPeriodoQueryVariables>(ResumenPeriodoDocument, options);
      }
export function useResumenPeriodoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ResumenPeriodoQuery, ResumenPeriodoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ResumenPeriodoQuery, ResumenPeriodoQueryVariables>(ResumenPeriodoDocument, options);
        }
// @ts-ignore
export function useResumenPeriodoSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ResumenPeriodoQuery, ResumenPeriodoQueryVariables>): Apollo.UseSuspenseQueryResult<ResumenPeriodoQuery, ResumenPeriodoQueryVariables>;
export function useResumenPeriodoSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ResumenPeriodoQuery, ResumenPeriodoQueryVariables>): Apollo.UseSuspenseQueryResult<ResumenPeriodoQuery | undefined, ResumenPeriodoQueryVariables>;
export function useResumenPeriodoSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ResumenPeriodoQuery, ResumenPeriodoQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ResumenPeriodoQuery, ResumenPeriodoQueryVariables>(ResumenPeriodoDocument, options);
        }
export type ResumenPeriodoQueryHookResult = ReturnType<typeof useResumenPeriodoQuery>;
export type ResumenPeriodoLazyQueryHookResult = ReturnType<typeof useResumenPeriodoLazyQuery>;
export type ResumenPeriodoSuspenseQueryHookResult = ReturnType<typeof useResumenPeriodoSuspenseQuery>;
export type ResumenPeriodoQueryResult = Apollo.QueryResult<ResumenPeriodoQuery, ResumenPeriodoQueryVariables>;
export const ProductosMasVendidosDocument = gql`
    query ProductosMasVendidos($opciones: DateRangeInput) {
  productosMasVendidos(opciones: $opciones) {
    productoId
    ean13
    nombreProducto
    totalVendido
    cantidadMovimientos
  }
}
    `;

/**
 * __useProductosMasVendidosQuery__
 *
 * To run a query within a React component, call `useProductosMasVendidosQuery` and pass it any options that fit your needs.
 * When your component renders, `useProductosMasVendidosQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProductosMasVendidosQuery({
 *   variables: {
 *      opciones: // value for 'opciones'
 *   },
 * });
 */
export function useProductosMasVendidosQuery(baseOptions?: Apollo.QueryHookOptions<ProductosMasVendidosQuery, ProductosMasVendidosQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProductosMasVendidosQuery, ProductosMasVendidosQueryVariables>(ProductosMasVendidosDocument, options);
      }
export function useProductosMasVendidosLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProductosMasVendidosQuery, ProductosMasVendidosQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProductosMasVendidosQuery, ProductosMasVendidosQueryVariables>(ProductosMasVendidosDocument, options);
        }
// @ts-ignore
export function useProductosMasVendidosSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ProductosMasVendidosQuery, ProductosMasVendidosQueryVariables>): Apollo.UseSuspenseQueryResult<ProductosMasVendidosQuery, ProductosMasVendidosQueryVariables>;
export function useProductosMasVendidosSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProductosMasVendidosQuery, ProductosMasVendidosQueryVariables>): Apollo.UseSuspenseQueryResult<ProductosMasVendidosQuery | undefined, ProductosMasVendidosQueryVariables>;
export function useProductosMasVendidosSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProductosMasVendidosQuery, ProductosMasVendidosQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProductosMasVendidosQuery, ProductosMasVendidosQueryVariables>(ProductosMasVendidosDocument, options);
        }
export type ProductosMasVendidosQueryHookResult = ReturnType<typeof useProductosMasVendidosQuery>;
export type ProductosMasVendidosLazyQueryHookResult = ReturnType<typeof useProductosMasVendidosLazyQuery>;
export type ProductosMasVendidosSuspenseQueryHookResult = ReturnType<typeof useProductosMasVendidosSuspenseQuery>;
export type ProductosMasVendidosQueryResult = Apollo.QueryResult<ProductosMasVendidosQuery, ProductosMasVendidosQueryVariables>;
export const RegistrarEntradaDocument = gql`
    mutation RegistrarEntrada($input: RegistrarEntradaInput!) {
  registrarEntrada(input: $input) {
    movimiento {
      ...MovimientoFull
    }
    stockActual
  }
}
    ${MovimientoFullFragmentDoc}`;
export type RegistrarEntradaMutationFn = Apollo.MutationFunction<RegistrarEntradaMutation, RegistrarEntradaMutationVariables>;

/**
 * __useRegistrarEntradaMutation__
 *
 * To run a mutation, you first call `useRegistrarEntradaMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegistrarEntradaMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registrarEntradaMutation, { data, loading, error }] = useRegistrarEntradaMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRegistrarEntradaMutation(baseOptions?: Apollo.MutationHookOptions<RegistrarEntradaMutation, RegistrarEntradaMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegistrarEntradaMutation, RegistrarEntradaMutationVariables>(RegistrarEntradaDocument, options);
      }
export type RegistrarEntradaMutationHookResult = ReturnType<typeof useRegistrarEntradaMutation>;
export type RegistrarEntradaMutationResult = Apollo.MutationResult<RegistrarEntradaMutation>;
export type RegistrarEntradaMutationOptions = Apollo.BaseMutationOptions<RegistrarEntradaMutation, RegistrarEntradaMutationVariables>;
export const RegistrarSalidaDocument = gql`
    mutation RegistrarSalida($input: RegistrarSalidaInput!) {
  registrarSalida(input: $input) {
    movimiento {
      ...MovimientoFull
    }
    stockActual
  }
}
    ${MovimientoFullFragmentDoc}`;
export type RegistrarSalidaMutationFn = Apollo.MutationFunction<RegistrarSalidaMutation, RegistrarSalidaMutationVariables>;

/**
 * __useRegistrarSalidaMutation__
 *
 * To run a mutation, you first call `useRegistrarSalidaMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegistrarSalidaMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registrarSalidaMutation, { data, loading, error }] = useRegistrarSalidaMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRegistrarSalidaMutation(baseOptions?: Apollo.MutationHookOptions<RegistrarSalidaMutation, RegistrarSalidaMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegistrarSalidaMutation, RegistrarSalidaMutationVariables>(RegistrarSalidaDocument, options);
      }
export type RegistrarSalidaMutationHookResult = ReturnType<typeof useRegistrarSalidaMutation>;
export type RegistrarSalidaMutationResult = Apollo.MutationResult<RegistrarSalidaMutation>;
export type RegistrarSalidaMutationOptions = Apollo.BaseMutationOptions<RegistrarSalidaMutation, RegistrarSalidaMutationVariables>;
export const StockProductoDocument = gql`
    query StockProducto($productId: ID!) {
  stockProducto(productId: $productId) {
    productId
    stockActual
    ultimoMovimiento
  }
}
    `;

/**
 * __useStockProductoQuery__
 *
 * To run a query within a React component, call `useStockProductoQuery` and pass it any options that fit your needs.
 * When your component renders, `useStockProductoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStockProductoQuery({
 *   variables: {
 *      productId: // value for 'productId'
 *   },
 * });
 */
export function useStockProductoQuery(baseOptions: Apollo.QueryHookOptions<StockProductoQuery, StockProductoQueryVariables> & ({ variables: StockProductoQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<StockProductoQuery, StockProductoQueryVariables>(StockProductoDocument, options);
      }
export function useStockProductoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<StockProductoQuery, StockProductoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<StockProductoQuery, StockProductoQueryVariables>(StockProductoDocument, options);
        }
// @ts-ignore
export function useStockProductoSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<StockProductoQuery, StockProductoQueryVariables>): Apollo.UseSuspenseQueryResult<StockProductoQuery, StockProductoQueryVariables>;
export function useStockProductoSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<StockProductoQuery, StockProductoQueryVariables>): Apollo.UseSuspenseQueryResult<StockProductoQuery | undefined, StockProductoQueryVariables>;
export function useStockProductoSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<StockProductoQuery, StockProductoQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<StockProductoQuery, StockProductoQueryVariables>(StockProductoDocument, options);
        }
export type StockProductoQueryHookResult = ReturnType<typeof useStockProductoQuery>;
export type StockProductoLazyQueryHookResult = ReturnType<typeof useStockProductoLazyQuery>;
export type StockProductoSuspenseQueryHookResult = ReturnType<typeof useStockProductoSuspenseQuery>;
export type StockProductoQueryResult = Apollo.QueryResult<StockProductoQuery, StockProductoQueryVariables>;
export const MovimientosProductoDocument = gql`
    query MovimientosProducto($productId: ID!, $query: QueryMovimientosInput) {
  movimientosProducto(productId: $productId, query: $query) {
    data {
      ...MovimientoFull
    }
    total
    page
    lastPage
  }
}
    ${MovimientoFullFragmentDoc}`;

/**
 * __useMovimientosProductoQuery__
 *
 * To run a query within a React component, call `useMovimientosProductoQuery` and pass it any options that fit your needs.
 * When your component renders, `useMovimientosProductoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMovimientosProductoQuery({
 *   variables: {
 *      productId: // value for 'productId'
 *      query: // value for 'query'
 *   },
 * });
 */
export function useMovimientosProductoQuery(baseOptions: Apollo.QueryHookOptions<MovimientosProductoQuery, MovimientosProductoQueryVariables> & ({ variables: MovimientosProductoQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MovimientosProductoQuery, MovimientosProductoQueryVariables>(MovimientosProductoDocument, options);
      }
export function useMovimientosProductoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MovimientosProductoQuery, MovimientosProductoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MovimientosProductoQuery, MovimientosProductoQueryVariables>(MovimientosProductoDocument, options);
        }
// @ts-ignore
export function useMovimientosProductoSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MovimientosProductoQuery, MovimientosProductoQueryVariables>): Apollo.UseSuspenseQueryResult<MovimientosProductoQuery, MovimientosProductoQueryVariables>;
export function useMovimientosProductoSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MovimientosProductoQuery, MovimientosProductoQueryVariables>): Apollo.UseSuspenseQueryResult<MovimientosProductoQuery | undefined, MovimientosProductoQueryVariables>;
export function useMovimientosProductoSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MovimientosProductoQuery, MovimientosProductoQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MovimientosProductoQuery, MovimientosProductoQueryVariables>(MovimientosProductoDocument, options);
        }
export type MovimientosProductoQueryHookResult = ReturnType<typeof useMovimientosProductoQuery>;
export type MovimientosProductoLazyQueryHookResult = ReturnType<typeof useMovimientosProductoLazyQuery>;
export type MovimientosProductoSuspenseQueryHookResult = ReturnType<typeof useMovimientosProductoSuspenseQuery>;
export type MovimientosProductoQueryResult = Apollo.QueryResult<MovimientosProductoQuery, MovimientosProductoQueryVariables>;
export const AlertasStockDocument = gql`
    query AlertasStock {
  alertasStock {
    producto {
      id
      nombre
      ean13
    }
    stockActual
    stockMinimo
    diferencia
  }
}
    `;

/**
 * __useAlertasStockQuery__
 *
 * To run a query within a React component, call `useAlertasStockQuery` and pass it any options that fit your needs.
 * When your component renders, `useAlertasStockQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAlertasStockQuery({
 *   variables: {
 *   },
 * });
 */
export function useAlertasStockQuery(baseOptions?: Apollo.QueryHookOptions<AlertasStockQuery, AlertasStockQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AlertasStockQuery, AlertasStockQueryVariables>(AlertasStockDocument, options);
      }
export function useAlertasStockLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AlertasStockQuery, AlertasStockQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AlertasStockQuery, AlertasStockQueryVariables>(AlertasStockDocument, options);
        }
// @ts-ignore
export function useAlertasStockSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AlertasStockQuery, AlertasStockQueryVariables>): Apollo.UseSuspenseQueryResult<AlertasStockQuery, AlertasStockQueryVariables>;
export function useAlertasStockSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AlertasStockQuery, AlertasStockQueryVariables>): Apollo.UseSuspenseQueryResult<AlertasStockQuery | undefined, AlertasStockQueryVariables>;
export function useAlertasStockSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AlertasStockQuery, AlertasStockQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AlertasStockQuery, AlertasStockQueryVariables>(AlertasStockDocument, options);
        }
export type AlertasStockQueryHookResult = ReturnType<typeof useAlertasStockQuery>;
export type AlertasStockLazyQueryHookResult = ReturnType<typeof useAlertasStockLazyQuery>;
export type AlertasStockSuspenseQueryHookResult = ReturnType<typeof useAlertasStockSuspenseQuery>;
export type AlertasStockQueryResult = Apollo.QueryResult<AlertasStockQuery, AlertasStockQueryVariables>;
export const AlertaStockBajoDocument = gql`
    subscription AlertaStockBajo {
  alertaStockBajo {
    producto {
      id
      nombre
      ean13
    }
    stockActual
    stockMinimo
    diferencia
  }
}
    `;

/**
 * __useAlertaStockBajoSubscription__
 *
 * To run a query within a React component, call `useAlertaStockBajoSubscription` and pass it any options that fit your needs.
 * When your component renders, `useAlertaStockBajoSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAlertaStockBajoSubscription({
 *   variables: {
 *   },
 * });
 */
export function useAlertaStockBajoSubscription(baseOptions?: Apollo.SubscriptionHookOptions<AlertaStockBajoSubscription, AlertaStockBajoSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<AlertaStockBajoSubscription, AlertaStockBajoSubscriptionVariables>(AlertaStockBajoDocument, options);
      }
export type AlertaStockBajoSubscriptionHookResult = ReturnType<typeof useAlertaStockBajoSubscription>;
export type AlertaStockBajoSubscriptionResult = Apollo.SubscriptionResult<AlertaStockBajoSubscription>;
export const ProductosDocument = gql`
    query Productos($query: QueryProductsInput) {
  productos(query: $query) {
    data {
      ...ProductoFull
    }
    total
    page
    lastPage
  }
}
    ${ProductoFullFragmentDoc}`;

/**
 * __useProductosQuery__
 *
 * To run a query within a React component, call `useProductosQuery` and pass it any options that fit your needs.
 * When your component renders, `useProductosQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProductosQuery({
 *   variables: {
 *      query: // value for 'query'
 *   },
 * });
 */
export function useProductosQuery(baseOptions?: Apollo.QueryHookOptions<ProductosQuery, ProductosQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProductosQuery, ProductosQueryVariables>(ProductosDocument, options);
      }
export function useProductosLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProductosQuery, ProductosQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProductosQuery, ProductosQueryVariables>(ProductosDocument, options);
        }
// @ts-ignore
export function useProductosSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ProductosQuery, ProductosQueryVariables>): Apollo.UseSuspenseQueryResult<ProductosQuery, ProductosQueryVariables>;
export function useProductosSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProductosQuery, ProductosQueryVariables>): Apollo.UseSuspenseQueryResult<ProductosQuery | undefined, ProductosQueryVariables>;
export function useProductosSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProductosQuery, ProductosQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProductosQuery, ProductosQueryVariables>(ProductosDocument, options);
        }
export type ProductosQueryHookResult = ReturnType<typeof useProductosQuery>;
export type ProductosLazyQueryHookResult = ReturnType<typeof useProductosLazyQuery>;
export type ProductosSuspenseQueryHookResult = ReturnType<typeof useProductosSuspenseQuery>;
export type ProductosQueryResult = Apollo.QueryResult<ProductosQuery, ProductosQueryVariables>;
export const ProductoPorEanDocument = gql`
    query ProductoPorEan($ean13: String!) {
  productoPorEan(ean13: $ean13) {
    ...ProductoFull
  }
}
    ${ProductoFullFragmentDoc}`;

/**
 * __useProductoPorEanQuery__
 *
 * To run a query within a React component, call `useProductoPorEanQuery` and pass it any options that fit your needs.
 * When your component renders, `useProductoPorEanQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProductoPorEanQuery({
 *   variables: {
 *      ean13: // value for 'ean13'
 *   },
 * });
 */
export function useProductoPorEanQuery(baseOptions: Apollo.QueryHookOptions<ProductoPorEanQuery, ProductoPorEanQueryVariables> & ({ variables: ProductoPorEanQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProductoPorEanQuery, ProductoPorEanQueryVariables>(ProductoPorEanDocument, options);
      }
export function useProductoPorEanLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProductoPorEanQuery, ProductoPorEanQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProductoPorEanQuery, ProductoPorEanQueryVariables>(ProductoPorEanDocument, options);
        }
// @ts-ignore
export function useProductoPorEanSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ProductoPorEanQuery, ProductoPorEanQueryVariables>): Apollo.UseSuspenseQueryResult<ProductoPorEanQuery, ProductoPorEanQueryVariables>;
export function useProductoPorEanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProductoPorEanQuery, ProductoPorEanQueryVariables>): Apollo.UseSuspenseQueryResult<ProductoPorEanQuery | undefined, ProductoPorEanQueryVariables>;
export function useProductoPorEanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProductoPorEanQuery, ProductoPorEanQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProductoPorEanQuery, ProductoPorEanQueryVariables>(ProductoPorEanDocument, options);
        }
export type ProductoPorEanQueryHookResult = ReturnType<typeof useProductoPorEanQuery>;
export type ProductoPorEanLazyQueryHookResult = ReturnType<typeof useProductoPorEanLazyQuery>;
export type ProductoPorEanSuspenseQueryHookResult = ReturnType<typeof useProductoPorEanSuspenseQuery>;
export type ProductoPorEanQueryResult = Apollo.QueryResult<ProductoPorEanQuery, ProductoPorEanQueryVariables>;
export const CrearProductoDocument = gql`
    mutation CrearProducto($input: CreateProductInput!) {
  crearProducto(input: $input) {
    ...ProductoFull
  }
}
    ${ProductoFullFragmentDoc}`;
export type CrearProductoMutationFn = Apollo.MutationFunction<CrearProductoMutation, CrearProductoMutationVariables>;

/**
 * __useCrearProductoMutation__
 *
 * To run a mutation, you first call `useCrearProductoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCrearProductoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [crearProductoMutation, { data, loading, error }] = useCrearProductoMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCrearProductoMutation(baseOptions?: Apollo.MutationHookOptions<CrearProductoMutation, CrearProductoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CrearProductoMutation, CrearProductoMutationVariables>(CrearProductoDocument, options);
      }
export type CrearProductoMutationHookResult = ReturnType<typeof useCrearProductoMutation>;
export type CrearProductoMutationResult = Apollo.MutationResult<CrearProductoMutation>;
export type CrearProductoMutationOptions = Apollo.BaseMutationOptions<CrearProductoMutation, CrearProductoMutationVariables>;
export const ActualizarProductoDocument = gql`
    mutation ActualizarProducto($id: ID!, $input: UpdateProductInput!) {
  actualizarProducto(id: $id, input: $input) {
    ...ProductoFull
  }
}
    ${ProductoFullFragmentDoc}`;
export type ActualizarProductoMutationFn = Apollo.MutationFunction<ActualizarProductoMutation, ActualizarProductoMutationVariables>;

/**
 * __useActualizarProductoMutation__
 *
 * To run a mutation, you first call `useActualizarProductoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useActualizarProductoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [actualizarProductoMutation, { data, loading, error }] = useActualizarProductoMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useActualizarProductoMutation(baseOptions?: Apollo.MutationHookOptions<ActualizarProductoMutation, ActualizarProductoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ActualizarProductoMutation, ActualizarProductoMutationVariables>(ActualizarProductoDocument, options);
      }
export type ActualizarProductoMutationHookResult = ReturnType<typeof useActualizarProductoMutation>;
export type ActualizarProductoMutationResult = Apollo.MutationResult<ActualizarProductoMutation>;
export type ActualizarProductoMutationOptions = Apollo.BaseMutationOptions<ActualizarProductoMutation, ActualizarProductoMutationVariables>;
export const DesactivarProductoDocument = gql`
    mutation DesactivarProducto($id: ID!) {
  desactivarProducto(id: $id)
}
    `;
export type DesactivarProductoMutationFn = Apollo.MutationFunction<DesactivarProductoMutation, DesactivarProductoMutationVariables>;

/**
 * __useDesactivarProductoMutation__
 *
 * To run a mutation, you first call `useDesactivarProductoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDesactivarProductoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [desactivarProductoMutation, { data, loading, error }] = useDesactivarProductoMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDesactivarProductoMutation(baseOptions?: Apollo.MutationHookOptions<DesactivarProductoMutation, DesactivarProductoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DesactivarProductoMutation, DesactivarProductoMutationVariables>(DesactivarProductoDocument, options);
      }
export type DesactivarProductoMutationHookResult = ReturnType<typeof useDesactivarProductoMutation>;
export type DesactivarProductoMutationResult = Apollo.MutationResult<DesactivarProductoMutation>;
export type DesactivarProductoMutationOptions = Apollo.BaseMutationOptions<DesactivarProductoMutation, DesactivarProductoMutationVariables>;