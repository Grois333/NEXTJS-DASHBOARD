import { test, expect } from '@playwright/test';
import { loginToDashboardFromHome } from './helpers/login-to-dashboard';
import { waitForAuthJsSessionCleared } from './helpers/wait-for-auth-session-cleared';

/**
 * Covers plan §1 Navigation (N1–N5): `playwright/specs/acme-dashboard.plan.md`
 * Requires the same credentials as `login.spec.ts` / `seed.spec.ts`.
 *
 * After `beforeEach`, the page is already at `/dashboard` — navigate with side-nav
 * clicks instead of extra `goto` calls to avoid reload/hydration timeouts with App Router.
 *
 * Side nav links use `data-testid` (`nav-home`, `nav-invoices`, `nav-customers`) so the
 * same selectors work on mobile (nav labels are icon-only) and avoid ambiguous roles.
 */
test.describe('Navigation (side nav + shell)', () => {
  test.beforeEach(async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL?.trim();
    const password = process.env.E2E_USER_PASSWORD?.trim();
    if (!email || !password) {
      test.skip();
      return;
    }

    await loginToDashboardFromHome(page);
  });

  test('N1: Home navigates to dashboard overview', async ({ page }) => {
    await page.getByTestId('nav-invoices').click();
    await expect(page).toHaveURL(/\/dashboard\/invoices/);

    await page.getByTestId('nav-home').click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole('heading', { name: /^Dashboard$/i }),
    ).toBeVisible();
  });

  test('N2: Invoices navigates to invoice list', async ({ page }) => {
    await page.getByTestId('nav-invoices').click();

    await expect(page).toHaveURL(/\/dashboard\/invoices/);
    await expect(
      page.getByRole('heading', { name: /^Invoices$/i }),
    ).toBeVisible();
  });

  test('N3: Customers navigates to customers placeholder', async ({ page }) => {
    await page.getByTestId('nav-customers').click();

    await expect(page).toHaveURL(/\/dashboard\/customers/);
    await expect(page.getByText('Customers Page')).toBeVisible();
  });

  test('N4: Acme logo requests /; session redirects to dashboard', async ({
    page,
  }) => {
    // auth.config sends logged-in users away from `/` to `/dashboard`.
    await page.locator('a[href="/"]').first().click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('N5: Sign out clears session', async ({ page }) => {
    await page.getByRole('button', { name: /sign out/i }).click();

    // Match A3: wait until Auth.js session cookie is gone (URL can be `/` before cookie clears on some engines), then `commit` + login URL.
    await expect(page).toHaveURL(/\/$/, { timeout: 30_000 });
    await waitForAuthJsSessionCleared(page);

    await Promise.all([
      page.waitForURL(/\/login/, { timeout: 30_000 }),
      page.goto('/dashboard', { waitUntil: 'commit' }),
    ]);
  });
});
