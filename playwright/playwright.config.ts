import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

/** Load env from repo root for local runs (never committed). CI uses injected env only. */
loadEnv({ path: path.join(process.cwd(), '.env') });
loadEnv({ path: path.join(process.cwd(), '.env.local'), override: true });

/** Repo root — run `pnpm test:e2e` from the project root so `pnpm start` resolves. */
const repoRoot = process.cwd();

/** Use `localhost` (not 127.0.0.1) so it matches NextAuth cookies / redirects. */
const baseURL =
  process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: '../tests/e2e',
  /** Login + dashboard DB/Suspense can exceed 60s when many projects run in parallel. */
  timeout: 120_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  /** Fewer workers = less contention on one Next server + Postgres (fewer mystery flakes). */
  workers: process.env.CI ? 2 : 4,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  /**
   * `setup-invoice` runs only `C1: happy path…` from `create-invoice.spec.ts` so the DB has the
   * newest row for `delete-invoice.spec.ts` (Chromium). Other projects `grepInvert` C1 so C1 is not duplicated.
   * X1 runs Chromium only; other browsers ignore delete to avoid parallel fights over one row.
   */
  projects: [
    {
      name: 'setup-invoice',
      testMatch: '**/create-invoice.spec.ts',
      grep: /C1: happy path/,
      use: { ...devices['Desktop Chrome'] },
      retries: process.env.CI ? 2 : 1,
    },
    {
      name: 'chromium',
      dependencies: ['setup-invoice'],
      grepInvert: /C1: happy path/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      dependencies: ['setup-invoice'],
      grepInvert: /C1: happy path/,
      testIgnore: '**/delete-invoice.spec.ts',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      dependencies: ['setup-invoice'],
      grepInvert: /C1: happy path/,
      testIgnore: '**/delete-invoice.spec.ts',
      use: { ...devices['Desktop Safari'] },
      retries: 2,
    },
    {
      name: 'Mobile Chrome',
      dependencies: ['setup-invoice'],
      grepInvert: /C1: happy path/,
      testIgnore: '**/delete-invoice.spec.ts',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      dependencies: ['setup-invoice'],
      grepInvert: /C1: happy path/,
      testIgnore: '**/delete-invoice.spec.ts',
      use: { ...devices['iPhone 12'] },
      retries: 2,
    },
  ],
  webServer: {
    command: 'pnpm start',
    cwd: repoRoot,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Forward env into the Next process (helps when Playwright spawns `pnpm start`).
    env: Object.fromEntries(
      Object.entries(process.env).filter(
        (e): e is [string, string] => e[1] !== undefined,
      ),
    ),
  },
});
