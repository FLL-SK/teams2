import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env['BASE_URL'] ?? 'http://localhost:4200';
const outDir = '../../dist/.playwright/apps/client-e2e';

/**
 * E2E testy klienta. API servera (http://localhost:5000) sa v testoch mockuje,
 * takže testy nepotrebujú bežiaci server ani MongoDB.
 */
export default defineConfig({
  testDir: './src',
  outputDir: `${outDir}/test-output`,
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: [['list'], ['html', { outputFolder: `${outDir}/report`, open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev:client',
    url: baseURL,
    cwd: '../../',
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
