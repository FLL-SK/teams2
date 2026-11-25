import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/libs/dateutils',
  resolve: { tsconfigPaths: true },
  test: {
    name: 'dateutils',
    environment: 'node',
    globals: true,
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    passWithNoTests: true,
    reporters: ['default'],
    // testy počítajú s lokálnym časom na Slovensku
    env: { TZ: 'Europe/Bratislava' },
  },
});
