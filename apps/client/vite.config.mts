import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';

// These options were migrated by @nx/vite:convert-to-inferred from the project.json file.
const configValues = { default: {}, development: {}, production: {} };

// Determine the correct configValue to use based on the configuration
const nxConfiguration = process.env.NX_TASK_TARGET_CONFIGURATION ?? 'default';

const options = {
  ...configValues.default,
  ...(configValues[nxConfiguration] ?? {}),
};

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/client',
  server: {
    port: 4200,
    host: '0.0.0.0',
  },
  preview: {
    port: 4300,
    host: '0.0.0.0',
  },

  plugins: [react(), tsConfigPaths()],
  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ tsConfigPaths() ],
  // },
  build: {
    outDir: '../../dist/apps/client',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    name: 'client',
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    passWithNoTests: true,
    reporters: ['default'],
  },
}));
