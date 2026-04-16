import { test } from '@playwright/test';
import { loginToDashboardFromHome } from './helpers/login-to-dashboard';

/**
 * Seed for Playwright Test Agents (planner / generator / healer).
 * Runs once to reach a known state (logged-in dashboard) so agents can explore the app.
 *
 * This is not a duplicate of `login.spec.ts` — that file asserts the login E2E contract.
 * Skip locally if `E2E_*` are unset (same as other E2E tests).
 */
test('seed', async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL?.trim();
  const password = process.env.E2E_USER_PASSWORD?.trim();
  if (!email || !password) {
    test.skip();
    return;
  }

  await loginToDashboardFromHome(page);
});
