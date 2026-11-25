import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/libs/auth-node',
  resolve: { tsconfigPaths: true },
  test: {
    name: 'auth-node',
    environment: 'node',
    globals: true,
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    passWithNoTests: true,
    reporters: ['default'],
  },
});
