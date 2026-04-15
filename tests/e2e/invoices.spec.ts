import { test, expect } from '@playwright/test';
import { loginToDashboardFromHome } from './helpers/login-to-dashboard';

/**
 * Plan §3 Invoice list (L1–L4): `playwright/specs/acme-dashboard.plan.md`
 * Requires `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` and a reachable DB with invoices.
 */
test.describe('Invoice list', () => {
  const streamed = { timeout: 120_000 };

  test.beforeEach(async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL?.trim();
    const password = process.env.E2E_USER_PASSWORD?.trim();
    if (!email || !password) {
      test.skip();
      return;
    }

    await page.setViewportSize({ width: 1280, height: 720 });
    await loginToDashboardFromHome(page);
    await page.getByTestId('nav-invoices').click();
    await expect(page).toHaveURL(/\/dashboard\/invoices/);
    await expect(
      page.getByRole('heading', { name: /^Invoices$/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Customer' }),
    ).toBeVisible(streamed);
  });

  test('L1: table structure at md+ viewport', async ({ page }) => {
    await expect(
      page.getByRole('columnheader', { name: 'Customer' }),
    ).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Amount' }),
    ).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Status' }),
    ).toBeVisible();

    const rowCount = await page.locator('table tbody tr').count();
    if (rowCount === 0) {
      test.skip();
      return;
    }

    const firstRow = page.locator('table tbody tr').first();
    await expect(
      firstRow.locator('img[alt*="profile picture"]'),
    ).toBeVisible();
    await expect(firstRow.locator('td').first()).not.toBeEmpty();
  });

  test('L2: mobile layout shows stacked cards with data and actions', async ({
    page,
  }) => {
    if ((await page.locator('table tbody tr').count()) === 0) {
      test.skip();
      return;
    }

    await page.setViewportSize({ width: 390, height: 844 });

    await expect(page.getByRole('table')).toBeHidden();

    const firstCard = page
      .locator('div.mt-6.flow-root .md\\:hidden')
      .locator('> div')
      .first();

    await expect(firstCard).toBeVisible(streamed);
    await expect(
      firstCard.locator('img[alt*="profile picture"]'),
    ).toBeVisible();
    await expect(firstCard.getByText(/@/)).toBeVisible();
    await expect(firstCard.locator('a[href$="/edit"]')).toBeVisible();
    await expect(
      firstCard.getByRole('button', { name: 'Delete' }),
    ).toBeVisible();
  });

  test('L3: Create Invoice navigates to create page', async ({ page }) => {
    await page.getByRole('link', { name: /create invoice/i }).click();

    await expect(page).toHaveURL(/\/dashboard\/invoices\/create$/);
  });

  test('L4: row has Update (edit link) and Delete controls', async ({
    page,
  }) => {
    if ((await page.locator('table tbody tr').count()) === 0) {
      test.skip();
      return;
    }

    const firstRow = page.locator('table tbody tr').first();

    const editLink = firstRow.locator('a[href$="/edit"]');
    await expect(editLink).toBeVisible();
    await expect(editLink).toHaveAttribute(
      'href',
      /\/dashboard\/invoices\/[^/]+\/edit$/,
    );

    await expect(
      firstRow.getByRole('button', { name: 'Delete' }),
    ).toBeVisible();
  });
});
