import { test, expect, type Page } from '@playwright/test';
import { dataTable, secondInvoiceRow } from './helpers/invoice-helpers';
import { loginToDashboardFromHome } from './helpers/login-to-dashboard';

/**
 * Plan §7 Edit invoice (E1–E3): `playwright/specs/acme-dashboard.plan.md`
 *
 * List: `app/ui/invoices/table.tsx` (Update link) · form: `app/ui/invoices/edit-form.tsx`
 *
 * E2 re-opens the edit page after save to assert the amount persisted (list can look stale
 * from RSC/cache right after redirect).
 *
 * E1/E2 use the **second** list row: X1 deletes the newest row (`tbody tr` first).
 */
test.describe('Edit invoice', () => {
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

  async function openInvoiceList(page: Page) {
    await page.getByTestId('nav-invoices').click();
    await expect(page).toHaveURL(/\/dashboard\/invoices/);
    await expect(
      page.getByRole('columnheader', { name: 'Customer' }),
    ).toBeVisible(streamed);
  }

  test('E1: update link opens editor with URL and prefilled form', async ({
    page,
  }) => {
    await openInvoiceList(page);

    if ((await dataTable(page).locator('tbody tr').count()) < 2) {
      test.skip();
      return;
    }

    const targetRow = secondInvoiceRow(page);
    const editLink = targetRow.locator('a[href$="/edit"]');
    const href = await editLink.getAttribute('href');
    const match = href?.match(/\/dashboard\/invoices\/([^/]+)\/edit/);
    expect(match?.[1]).toBeTruthy();
    const id = match![1];

    await editLink.click();

    await expect(page).toHaveURL(new RegExp(`/dashboard/invoices/${id}/edit$`));
    await expect(page.getByRole('button', { name: 'Edit Invoice' })).toBeVisible();

    const amountInput = page.getByLabel('Choose an amount');
    await expect(amountInput).toBeVisible();
    const amountVal = Number(await amountInput.inputValue());
    expect(amountVal).toBeGreaterThan(0);

    const customerSelect = page.getByLabel('Choose customer');
    await expect(customerSelect).toBeVisible();
    const customerVal = await customerSelect.inputValue();
    expect(customerVal.length).toBeGreaterThan(0);

    const pendingChecked = await page
      .getByRole('radio', { name: /^pending$/i })
      .isChecked();
    const paidChecked = await page.getByRole('radio', { name: /^paid$/i }).isChecked();
    expect(pendingChecked || paidChecked).toBe(true);
  });

  test('E2: submit update redirects to list; persisted amount on re-open edit', async ({
    page,
  }) => {
    await openInvoiceList(page);

    if ((await dataTable(page).locator('tbody tr').count()) < 2) {
      test.skip();
      return;
    }

    const targetRow = secondInvoiceRow(page);
    const editHref = await targetRow.locator('a[href$="/edit"]').getAttribute('href');
    const idMatch = editHref?.match(/\/dashboard\/invoices\/([^/]+)\/edit/);
    expect(idMatch?.[1]).toBeTruthy();
    const invoiceId = idMatch![1];

    await targetRow.locator('a[href$="/edit"]').click();

    const newDollars = 442.17;
    const amountStr = String(newDollars);

    const amountInput = page.getByLabel('Choose an amount');
    await amountInput.clear();
    await amountInput.fill(amountStr);
    await page.getByRole('button', { name: 'Edit Invoice' }).click();

    await expect(page).toHaveURL(/\/dashboard\/invoices$/, { timeout: 30_000 });

    await page.goto(`/dashboard/invoices/${invoiceId}/edit`);
    await expect(page.getByRole('button', { name: 'Edit Invoice' })).toBeVisible({
      timeout: streamed.timeout,
    });
    await expect(page.getByLabel('Choose an amount')).toHaveValue(amountStr);
  });

  test('E3: invalid invoice id shows 404', async ({ page }) => {
    const fakeId = '11111111-1111-1111-1111-111111111111';
    const response = await page.goto(
      `/dashboard/invoices/${fakeId}/edit`,
    );

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: /404 not found/i })).toBeVisible();
    await expect(page.getByText('Could not find the requested invoice.')).toBeVisible();
  });
});
