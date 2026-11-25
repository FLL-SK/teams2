import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/server',
  resolve: { tsconfigPaths: true },
  test: {
    name: 'server',
    environment: 'node',
    globals: true,
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    // integračné testy (MongoDB v pamäti) bežia samostatne – vitest.integration.config.mts
    exclude: ['src/**/*.int.spec.ts'],
    passWithNoTests: true,
    reporters: ['default'],
  },
});
