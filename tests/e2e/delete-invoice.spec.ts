import { test } from '@playwright/test';
import { loginToDashboardFromHome } from './helpers/login-to-dashboard';
import {
  createHappyPathC1Invoice,
  deleteFirstC1InvoiceRow,
} from './helpers/c1-invoice';

/**
 * Plan §8 (X1): create a C1-style invoice, then delete it.
 *
 * Browser projects share one DB and run in parallel; a single global C1 row would be removed
 * by the first project’s delete and break the others — so each run seeds its own row here.
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

  test('X1: delete removes one C1-style invoice row', async ({ page }) => {
    await createHappyPathC1Invoice(page, streamed);
    await deleteFirstC1InvoiceRow(page, streamed);
  });
});
