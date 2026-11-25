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
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      // vzor autorizácie: `this.userGuard.isAdmin() || this.userGuard.notAuthorized('…')`
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],
    },
  },
  {
    // lint s typovými informáciami pre server – zachytí napr. Promise v podmienke
    // (`guard.isCoach(id) || guard.notAuthorized()` bez await, #279)
    files: ['apps/server/src/**/*.ts', 'libs/auth-node/src/**/*.ts'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksConditionals: true, checksVoidReturn: false },
      ],
    },
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
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  prettier,
]);
