import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Integračné testy servera nad MongoDB v pamäti (mongodb-memory-server).
// Spustenie: `pnpm test:integration`
export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/server-integration',
  resolve: { tsconfigPaths: true },
  test: {
    name: 'server-integration',
    environment: 'node',
    globals: true,
    include: ['src/**/*.int.spec.ts'],
    globalSetup: ['src/test/global-setup.ts'],
    setupFiles: ['src/test/setup.ts'],
    // každý testovací súbor má vlastnú databázu, súbory však bežia postupne (jeden mongod)
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 180_000, // prvé spustenie sťahuje binárku mongod
    reporters: ['default'],
    env: {
      TZ: 'Europe/Bratislava',
      NODE_ENV: 'test',
      APP_JWT_SECRET: 'integration-test-secret',
      SUPERADMIN_USERNAME: 'superadmin@example.com',
      APP_EMAIL_FROM: 'tms@example.com',
      TEAMS_ADMIN_EMAIL: 'admin@example.com',
      // schéma vygenerovaná cez `pnpm generate`
      APP_GRAPHQL_SCHEMA: path.resolve(import.meta.dirname, '../../dist/schema.graphql'),
    },
  },
});
