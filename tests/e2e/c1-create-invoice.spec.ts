import { test } from '@playwright/test';
import { loginToDashboardFromHome } from './helpers/login-to-dashboard';
import { createHappyPathC1Invoice } from './helpers/c1-invoice';

/**
 * Plan §6 C1 only — runs in the **chromium** project (other browsers ignore this file).
 * Run alone: `pnpm exec playwright test c1-create-invoice.spec.ts`.
 */
test.describe('Create invoice (C1)', () => {
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
  });

  test('C1: happy path creates invoice and returns to list', async ({ page }) => {
    await createHappyPathC1Invoice(page, streamed);
  });
});
