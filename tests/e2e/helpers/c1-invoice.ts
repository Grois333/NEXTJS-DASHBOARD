import { expect, type Page } from '@playwright/test';

/** Matches `createInvoice` happy-path E2E amount (plan §6 C1 / §8 X1). */
export const C1_DOLLARS = 777.77;

export const c1Formatted = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(C1_DOLLARS);

export function dataTable(page: Page) {
  return page.locator('table').filter({
    has: page.getByRole('columnheader', { name: 'Customer' }),
  });
}

export function rowC1Invoice(page: Page) {
  return dataTable(page)
    .locator('tbody tr')
    .filter({ hasText: /Evil Rabbit/i })
    .filter({ hasText: c1Formatted });
}

/**
 * First invoice row whose visible text does not include the C1 amount string.
 * Use in edit specs so they do not race `delete-invoice` (X1), which deletes the newest C1-style row.
 */
export function firstInvoiceRowExcludingC1Amount(page: Page) {
  return dataTable(page)
    .locator('tbody tr')
    .filter({ hasNotText: c1Formatted })
    .first();
}

export async function openCreateInvoice(page: Page, timeout: number) {
  await page.goto('/dashboard/invoices/create');
  await expect(page.getByLabel('Choose customer')).toBeVisible({
    timeout,
  });
}

/**
 * Plan §6 C1: fill form, submit, assert list shows the new row (via `?query=77777` — paging-safe).
 */
export async function createHappyPathC1Invoice(page: Page, streamed: {
  timeout: number;
}) {
  await openCreateInvoice(page, streamed.timeout);

  await page.getByLabel('Choose customer').selectOption({ label: 'Evil Rabbit' });
  await page.getByLabel('Choose an amount').fill(String(C1_DOLLARS));
  await page.getByRole('radio', { name: /^pending$/i }).check();

  await page.getByRole('button', { name: 'Create Invoice' }).click();

  await expect(page).toHaveURL(/\/dashboard\/invoices$/, { timeout: 30_000 });
  await expect
    .poll(
      async () => {
        await page.goto('/dashboard/invoices?query=77777', {
          waitUntil: 'domcontentloaded',
        });
        return rowC1Invoice(page).count();
      },
      { timeout: 45_000 },
    )
    .toBeGreaterThan(0);
  await expect(
    page.getByRole('columnheader', { name: 'Customer' }),
  ).toBeVisible(streamed);
}

/**
 * Plan §8 X1: delete the newest C1-style row (Evil Rabbit + `c1Formatted`) from the filtered list.
 * Call `createHappyPathC1Invoice` first in the test so each browser project has its own row.
 *
 * The list is ordered by invoice date, then `created_at` descending (`fetchFilteredInvoices`), so among
 * same-day matches the **first** row is the most recently created.
 */
export async function deleteFirstC1InvoiceRow(page: Page, streamed: {
  timeout: number;
}) {
  await page.goto('/dashboard/invoices?query=77777', { waitUntil: 'load' });
  await expect(
    page.getByRole('columnheader', { name: 'Customer' }),
  ).toBeVisible(streamed);

  const row = rowC1Invoice(page);
  await expect.poll(() => row.count(), { timeout: 30_000 }).toBeGreaterThan(0);

  const targetRow = row.first();
  const editLink = targetRow.locator('a[href$="/edit"]').first();
  await expect(editLink).toBeVisible();
  const href = await editLink.getAttribute('href');
  expect(href).toMatch(/\/dashboard\/invoices\/[^/]+\/edit$/);

  const deleteResponse = page.waitForResponse(
    (r) =>
      r.request().method() === 'POST' &&
      r.url().includes('/dashboard/invoices') &&
      r.status() === 200,
    { timeout: 45_000 },
  );
  await targetRow.getByRole('button', { name: 'Delete' }).click();
  await deleteResponse;

  await page.goto('/dashboard/invoices?query=77777', { waitUntil: 'load' });
  await expect(dataTable(page).locator(`tbody a[href="${href}"]`)).toHaveCount(
    0,
    { timeout: 30_000 },
  );
}
