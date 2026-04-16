import { expect, test } from '@playwright/test';
import {
  createHappyPathInvoice,
  dataTable,
  deleteNewestInvoiceRow,
} from './helpers/invoice-helpers';
import { loginToDashboardFromHome } from './helpers/login-to-dashboard';

/**
 * Plan §8 (X1): delete the **newest** invoice (first row) — same row `setup-invoice` added via C1.
 * Chromium only; standalone run creates a row if the list is empty.
 */
test.describe('Delete invoice', () => {
  const streamed = { timeout: 120_000 };

  test.use({ viewport: { width: 1280, height: 720 } });

  test.beforeEach(async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL?.trim();
    const password = process.env.E2E_USER_PASSWORD?.trim();
    if (!email || !password) {
      test.skip();
      return;
    }
    await loginToDashboardFromHome(page);
  });

  test('X1: delete removes the newest invoice row', async ({ page }) => {
    await page.goto('/dashboard/invoices?page=1', { waitUntil: 'load' });
    await expect(
      page.getByRole('columnheader', { name: 'Customer' }),
    ).toBeVisible(streamed);

    if ((await dataTable(page).locator('tbody tr').count()) === 0) {
      await createHappyPathInvoice(page, streamed);
    }

    await deleteNewestInvoiceRow(page, streamed);
  });
});
