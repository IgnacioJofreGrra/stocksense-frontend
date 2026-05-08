import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

/**
 * ESLint flat config para el frontend.
 *
 * - Ignoramos `dist`, los componentes shadcn (codigo "vendoreado" que se
 *   actualiza con la CLI; modificarlo a mano se pierde) y el output del
 *   graphql-codegen (regenerable con `npm run codegen`).
 */
export default defineConfig([
  globalIgnores(['dist', 'src/components/ui/**', 'src/generated/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
