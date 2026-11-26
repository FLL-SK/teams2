import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig([
  globalIgnores([
    '**/node_modules',
    '.claude',
    '**/dist',
    '**/_generated',
    'tmp',
    'coverage',
    'graphql.schema.json',
    'apps/client/public/assets/variables.js',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    // nepotrebné eslint-disable direktívy sú chyba (#294)
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // zámerne nepoužité parametre/premenné začínajú `_` (napr. `(_parent, args)` v resolveroch)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // `==` iba pri porovnaní s null (`x == null` = null alebo undefined), inak `===` (#302)
      eqeqeq: ['error', 'smart'],
      // výrazy bez príkazu (`a || guard.notAuthorized()`, `cb && cb()`) nie – kontroly oprávnení
      // cez `await guard.require(…)`, voliteľné volanie cez `cb?.()` (#297)
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: false, allowTernary: false },
      ],
    },
  },
  {
    // lint s typovými informáciami – zachytí napr. Promise v podmienke
    // (`guard.isCoach(id) || guard.notAuthorized()` bez await, #279) alebo neošetrený Promise
    files: ['apps/**/src/**/*.{ts,tsx}', 'libs/*/src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // zámerné „spusti a nečakaj“ označ `void` (napr. `void refetch()`)
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  {
    files: ['apps/server/src/**/*.ts', 'libs/auth-node/src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksConditionals: true, checksVoidReturn: false },
      ],
    },
  },
  {
    // klient: async handler v JSX atribúte (`onClick={async () => …}`) je v poriadku (#302)
    files: ['apps/client/src/**/*.{ts,tsx}', 'libs/auth-react/src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksConditionals: true, checksVoidReturn: { attributes: false } },
      ],
    },
  },
  {
    // na logovanie je `@teams2/logger` (#302)
    files: ['apps/server/src/**/*.ts', 'libs/*/src/**/*.ts'],
    rules: { 'no-console': 'error' },
  },
  {
    files: ['apps/client/**/*.{ts,tsx,js,jsx}', 'libs/auth-react/**/*.{ts,tsx,js,jsx}'],
    extends: [react.configs.flat.recommended, react.configs.flat['jsx-runtime']],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  prettier,
]);
