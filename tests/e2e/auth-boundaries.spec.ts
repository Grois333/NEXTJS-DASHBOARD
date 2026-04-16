import { test, expect } from '@playwright/test';
import { loginToDashboardFromHome } from './helpers/login-to-dashboard';

/**
 * Plan §10 Auth boundaries (A1–A3): `playwright/specs/acme-dashboard.plan.md`
 *
 * A1 uses a fresh browser context (no session). A2/A3 reuse `loginToDashboardFromHome` like other suites.
 */
test.describe('Auth boundaries', () => {
  const streamed = { timeout: 120_000 };

  test('A1: unauthenticated visit to /dashboard redirects to login', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await Promise.all([
        page.waitForURL(/\/login/, { timeout: 30_000 }),
        page.goto('/dashboard', { waitUntil: 'commit' }),
      ]);
    } finally {
      await context.close();
    }
  });

  test('A2: when logged in, / and /login redirect to dashboard', async ({
    page,
  }) => {
    const email = process.env.E2E_USER_EMAIL?.trim();
    const password = process.env.E2E_USER_PASSWORD?.trim();
    if (!email || !password) {
      test.skip();
      return;
    }

    await page.setViewportSize({ width: 1280, height: 720 });
    await loginToDashboardFromHome(page);

    // Logged-in users are redirected off `/` and `/login` immediately. `waitUntil: 'load'` can flake
    // (redirect tears down the document; Turbopack/HMR during `pnpm dev` makes it worse). Prefer
    // `commit` + waiting for the final URL.
    await Promise.all([
      page.waitForURL(/\/dashboard$/, { timeout: 30_000 }),
      page.goto('/', { waitUntil: 'commit' }),
    ]);

    await Promise.all([
      page.waitForURL(/\/dashboard$/, { timeout: 30_000 }),
      page.goto('/login', { waitUntil: 'commit' }),
    ]);

    await expect(
      page.getByRole('heading', { name: /^Dashboard$/i }),
    ).toBeVisible(streamed);
  });

  test('A3: after sign out, /dashboard requires login again', async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL?.trim();
    const password = process.env.E2E_USER_PASSWORD?.trim();
    if (!email || !password) {
      test.skip();
      return;
    }

    await page.setViewportSize({ width: 1280, height: 720 });
    await loginToDashboardFromHome(page);

    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 30_000 });

    await Promise.all([
      page.waitForURL(/\/login/, { timeout: 30_000 }),
      page.goto('/dashboard', { waitUntil: 'commit' }),
    ]);
  });
});
