import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

/** Load `.env` from repo root for local runs (never committed). CI uses injected env only. */
loadEnv({ path: path.join(process.cwd(), '.env') });

/** Repo root — run `pnpm test:e2e` from the project root so `pnpm start` resolves. */
const repoRoot = process.cwd();

/** Use `localhost` (not 127.0.0.1) so it matches NextAuth cookies / redirects. */
const baseURL =
  process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: '../tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'pnpm start',
    cwd: repoRoot,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
