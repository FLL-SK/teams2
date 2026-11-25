import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  test: {
    name: 'scripts',
    environment: 'node',
    globals: true,
    include: ['**/*.{spec,test}.ts'],
    reporters: ['default'],
  },
});
