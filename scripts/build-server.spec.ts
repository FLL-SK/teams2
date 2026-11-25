import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildServer } from './build-server.mjs';

describe('build-server', () => {
  let outDir: string;

  beforeAll(async () => {
    outDir = path.join(mkdtempSync(path.join(tmpdir(), 'teams2-server-')), 'server');
    await buildServer({ outDir, logLevel: 'silent' });
  }, 60_000);

  afterAll(() => {
    rmSync(path.dirname(outDir), { recursive: true, force: true });
  });

  it('vytvorí main.js a skopíruje assets', () => {
    expect(existsSync(path.join(outDir, 'main.js'))).toBe(true);
    expect(existsSync(path.join(outDir, 'assets/logo.png'))).toBe(true);
  });

  it('pribalí knižnice @teams2/* a balíky z node_modules nechá externé', () => {
    const code = readFileSync(path.join(outDir, 'main.js'), 'utf8');
    expect(code).not.toMatch(/require\(["']@teams2\//);
    expect(code).toMatch(/require\(["']express["']\)/);
    expect(code).toMatch(/require\(["']mongoose["']\)/);
    expect(code).toMatch(/require\(["']@apollo\/server["']\)/);
  });
});
