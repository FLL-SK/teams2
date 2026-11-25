import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/libs/auth-react',
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    name: 'auth-react',
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    passWithNoTests: true,
    reporters: ['default'],
  },
});
