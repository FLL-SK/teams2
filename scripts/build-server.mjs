// Build servera (náhrada za Nx executor @nx/esbuild).
// Zdroják servera aj knižnice @teams2/* (aliasy z tsconfig.base.json) sa zbalia do jedného
// súboru dist/apps/server/main.js, balíky z node_modules zostávajú externé
// (v Docker obraze sa inštalujú cez `pnpm install --prod`).
// Použitie: node scripts/build-server.mjs [--sourcemap]
import { build } from 'esbuild';
import { cpSync, rmSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const defaultOutDir = path.join(root, 'dist/apps/server');

/**
 * @param {{ outDir?: string, sourcemap?: boolean, logLevel?: import('esbuild').LogLevel }} [options]
 */
export async function buildServer(options = {}) {
  const { outDir = defaultOutDir, sourcemap = false, logLevel = 'info' } = options;
  rmSync(outDir, { recursive: true, force: true });
  const result = await build({
    absWorkingDir: root,
    entryPoints: ['apps/server/src/main.ts'],
    outfile: path.join(outDir, 'main.js'),
    tsconfig: 'apps/server/tsconfig.app.json',
    bundle: true,
    packages: 'external',
    platform: 'node',
    target: 'node26',
    format: 'cjs',
    sourcemap,
    logLevel,
  });
  cpSync(path.join(root, 'apps/server/src/assets'), path.join(outDir, 'assets'), {
    recursive: true,
  });
  return result;
}

if (import.meta.main) {
  await buildServer({ sourcemap: process.argv.includes('--sourcemap') });
}
