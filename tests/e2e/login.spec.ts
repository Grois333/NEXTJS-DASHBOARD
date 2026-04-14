import { test, expect } from '@playwright/test';

function requireE2eCredentials(): { email: string; password: string } {
  const email = process.env.E2E_USER_EMAIL?.trim();
  const password = process.env.E2E_USER_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error(
      'Set E2E_USER_EMAIL and E2E_USER_PASSWORD. Locally: add them to .env (gitignored). In CI: add GitHub Actions secrets with the same names.',
    );
  }
  return { email, password };
}

test.describe('Login', () => {
  test('home → login form → dashboard', async ({ page }) => {
    const { email, password } = requireE2eCredentials();

    await page.goto('/');
    await page.getByRole('link', { name: /log in/i }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole('heading', { name: /dashboard/i }),
    ).toBeVisible();
  });
});
