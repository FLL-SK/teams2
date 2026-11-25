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
    passWithNoTests: true,
    reporters: ['default'],
  },
});
