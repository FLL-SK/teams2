// Typová kontrola všetkých projektov (náhrada za Nx cieľ `typecheck`).
// Použitie: node scripts/typecheck.mjs [filter]   napr. `node scripts/typecheck.mjs client`
import { globSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');

const filter = process.argv[2];
const configs = [
  ...globSync('{apps,libs}/*/tsconfig.{app,lib,spec}.json'),
  ...globSync('apps/client-e2e/tsconfig.json'),
]
  .sort()
  .filter((c) => !filter || c.includes(filter));

let failed = 0;
for (const config of configs) {
  console.log(`> tsc --noEmit -p ${config}`);
  const res = spawnSync(process.execPath, [tsc, '--noEmit', '-p', config], { stdio: 'inherit' });
  if (res.status !== 0) failed++;
}

if (failed) {
  console.error(`Typová kontrola zlyhala v ${failed} z ${configs.length} konfigurácií.`);
  process.exit(1);
}
console.log(`Typová kontrola OK (${configs.length} konfigurácií).`);
