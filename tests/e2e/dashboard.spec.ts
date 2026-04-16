import { test, expect } from '@playwright/test';
import { loginToDashboardFromHome } from './helpers/login-to-dashboard';

/**
 * Plan §2 — after login, assert dashboard shell + streamed cards/charts.
 * Serial: D1 then D2 in one worker (less duplicate login + less parallel DB load).
 */
test.describe('Dashboard overview', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeEach(async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL?.trim();
    const password = process.env.E2E_USER_PASSWORD?.trim();
    if (!email || !password) {
      test.skip();
      return;
    }

    await loginToDashboardFromHome(page);
    // Stay on the post-login URL. A second `goto('/dashboard')` can hang waiting for
    // `domcontentloaded` while RSC/streaming is still open — use assertions below instead.
  });

  /** Cards hit Postgres + RSC streaming; allow long tail under parallel E2E load. */
  const streamed = { timeout: 120_000 };

  test('D1: overview loads with main regions', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /^Dashboard$/i }),
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Collected' }),
    ).toBeVisible(streamed);
    await expect(page.getByRole('heading', { name: 'Pending' })).toBeVisible(
      streamed,
    );
    await expect(
      page.getByRole('heading', { name: 'Total Invoices' }),
    ).toBeVisible(streamed);
    await expect(
      page.getByRole('heading', { name: 'Total Customers' }),
    ).toBeVisible(streamed);

    await expect(
      page.getByRole('heading', { name: 'Recent Revenue' }),
    ).toBeVisible(streamed);
    await expect(
      page.getByRole('heading', { name: 'Latest Invoices' }),
    ).toBeVisible(streamed);
  });

  test('D2: overview shows card data and revenue or empty state', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { name: 'Collected' }),
    ).toBeVisible(streamed);

    const collectedCard = page
      .getByRole('heading', { name: 'Collected' })
      .locator('..')
      .locator('..');
    await expect(collectedCard.locator('> p').first()).toHaveText(/\d/);

    await expect(
      page.getByText('Last 12 months').or(page.getByText('No data available.')),
    ).toBeVisible(streamed);

    await expect(page.getByText('Updated just now')).toBeVisible(streamed);
  });
});
