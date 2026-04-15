import { test, expect, type Page } from '@playwright/test';
import { loginToDashboardFromHome } from './helpers/login-to-dashboard';

/**
 * Plan §6 Create invoice (C1–C3 + invalid amount): `playwright/specs/acme-dashboard.plan.md`
 *
 * Form: `app/ui/invoices/create-form.tsx` · validation: `createInvoice` in `app/lib/actions.ts`
 */
test.describe('Create invoice', () => {
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

  async function openCreateInvoice(page: Page) {
    await page.goto('/dashboard/invoices/create');
    await expect(page.getByLabel('Choose customer')).toBeVisible({
      timeout: streamed.timeout,
    });
  }

  test('C1: happy path creates invoice and returns to list', async ({ page }) => {
    await openCreateInvoice(page);

    const uniqueDollars = 777.77;
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(uniqueDollars);

    await page.getByLabel('Choose customer').selectOption({ label: 'Evil Rabbit' });
    await page.getByLabel('Choose an amount').fill(String(uniqueDollars));
    await page.getByRole('radio', { name: /^pending$/i }).check();

    await page.getByRole('button', { name: 'Create Invoice' }).click();

    await expect(page).toHaveURL(/\/dashboard\/invoices$/, { timeout: 30_000 });
    await expect(
      page.getByRole('columnheader', { name: 'Customer' }),
    ).toBeVisible(streamed);

    await expect(page.getByRole('table')).toContainText(formatted);
    await expect(page.getByRole('table')).toContainText('Evil Rabbit');
  });

  test('C2: empty submit shows field validation; stays on create page', async ({
    page,
  }) => {
    await openCreateInvoice(page);

    await page.getByRole('button', { name: 'Create Invoice' }).click();

    await expect(page).toHaveURL(/\/dashboard\/invoices\/create/);
    await expect(
      page.getByRole('alert').getByText('Missing fields. Failed to create invoice.'),
    ).toBeVisible();
    await expect(page.getByText('Please select a customer.')).toBeVisible();
    await expect(
      page.getByText('Please enter an amount greater than $0'),
    ).toBeVisible();
    await expect(page.getByText('Please select an invoice status.')).toBeVisible();
  });

  test('C3: Cancel navigates to invoice list without creating', async ({ page }) => {
    await openCreateInvoice(page);

    await page.getByRole('link', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/\/dashboard\/invoices$/);
    await expect(
      page.getByRole('heading', { name: /^Invoices$/i }),
    ).toBeVisible(streamed);
  });

  test('C4: zero or negative amount shows validation; stays on create page', async ({
    page,
  }) => {
    await openCreateInvoice(page);

    await page.getByLabel('Choose customer').selectOption({ label: 'Evil Rabbit' });
    await page.getByRole('radio', { name: /^pending$/i }).check();

    const amount = page.getByLabel('Choose an amount');
    // `min="0.01"` can block submit in the browser before the server runs; set value in JS so Zod runs.
    await amount.evaluate((el: HTMLInputElement) => {
      el.removeAttribute('min');
      el.value = '0';
    });
    await page.getByRole('button', { name: 'Create Invoice' }).click();
    await expect(page).toHaveURL(/\/dashboard\/invoices\/create/);
    await expect(
      page.getByText('Please enter an amount greater than $0'),
    ).toBeVisible();

    await amount.evaluate((el: HTMLInputElement) => {
      el.removeAttribute('min');
      el.value = '-50';
    });
    await page.getByRole('button', { name: 'Create Invoice' }).click();
    await expect(page).toHaveURL(/\/dashboard\/invoices\/create/);
    await expect(
      page.getByText('Please enter an amount greater than $0'),
    ).toBeVisible();
  });
});
