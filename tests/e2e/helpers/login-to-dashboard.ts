import { expect, type Page } from '@playwright/test';

/**
 * Home → login form → submit → expect `/dashboard`.
 * Do not use `page.waitForURL()` inside `Promise.all` with click — it can wait for `load`,
 * which App Router may never emit on `/dashboard` while streaming.
 */
export async function loginToDashboardFromHome(page: Page) {
  await page.goto('/');
  await page.getByRole('link', { name: /log in/i }).click();
  await expect(page).toHaveURL(/\/login/);
  const email = process.env.E2E_USER_EMAIL?.trim();
  const password = process.env.E2E_USER_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error('E2E_USER_EMAIL and E2E_USER_PASSWORD are required');
  }
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);

  const submit = page.getByRole('button', { name: /log in/i });
  await expect(submit).toBeEnabled({ timeout: 10_000 });

  // Pointer click (real user). WebKit sometimes drops it under parallel load — fallback below.
  await submit.click();

  try {
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  } catch {
    // One programmatic submit matches native form POST (helps WebKit / Mobile Safari).
    await page
      .locator('form')
      .filter({ has: page.getByLabel('Email') })
      .first()
      .evaluate((form: HTMLFormElement) => form.requestSubmit());
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  }
}
