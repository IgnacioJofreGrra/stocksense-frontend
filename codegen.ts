import type { CodegenConfig } from '@graphql-codegen/cli';

/**
 * codegen — genera tipos TS y hooks de Apollo desde el schema del backend
 * por introspeccion sobre /graphql.
 *
 * Output: src/generated/graphql.ts contiene:
 * - Todos los tipos del schema (Product, StockMovement, AlertaStock, etc.)
 * - Tipos de los Inputs (CreateProductInput, RegistrarSalidaInput, etc.)
 * - Hooks tipados (useProductosQuery, useRegistrarSalidaMutation,
 *   useAlertaStockBajoSubscription, etc.) generados a partir de los
 *   archivos .graphql de src/graphql/.
 *
 * Por que: 0 tipos a mano. Si manana cambia el schema, regenerar y TS te
 * marca los lugares que dejaron de tipar bien. Es la principal ventaja de
 * GraphQL para el frontend.
 *
 * Necesita el backend corriendo en localhost:3000 al momento de ejecutar
 * `npm run codegen`.
 */
const config: CodegenConfig = {
  // Apuntamos al endpoint del backend via introspeccion. Necesita backend
  // corriendo localmente (npm run start:dev en el repo backend).
  schema: 'http://localhost:3000/graphql',
  documents: ['src/**/*.graphql'],
  generates: {
    'src/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
        // enumsAsConst: enums como `as const` con keys uppercase. Mejor
        // que TS enums (mas tree-shakeable) sin causar duplicados que sí
        // genera enumsAsTypes en combinacion con typescript-operations.
        enumsAsConst: true,
      },
    },
  },
};

export default config;
