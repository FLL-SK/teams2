import { defineConfig } from 'vitest/config';

// Spoločná konfigurácia Vitestu – každý projekt má vlastný vitest.config.mts (resp. vite.config.mts).
// Spustenie jedného projektu: `pnpm test --project server`
export default defineConfig({
  test: {
    projects: ['apps/server', 'apps/client', 'libs/*/vitest.config.mts', 'scripts'],
  },
});
