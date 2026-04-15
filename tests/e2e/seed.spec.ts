import { test, expect } from '@playwright/test';

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

  await page.goto('/');
  await page.getByRole('link', { name: /log in/i }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: /log in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});
