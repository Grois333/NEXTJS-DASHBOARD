import { expect, type Page } from '@playwright/test';

/** Happy-path E2E amount (plan §6 C1) — Evil Rabbit + $777.77 pending. */
export const HAPPY_PATH_DOLLARS = 777.77;

export function dataTable(page: Page) {
  return page.locator('table').filter({
    has: page.getByRole('columnheader', { name: 'Customer' }),
  });
}

/** Second data row — use for edit tests while X1 deletes the newest row (`first()`). */
export function secondInvoiceRow(page: Page) {
  return dataTable(page).locator('tbody tr').nth(1);
}

export async function openCreateInvoice(page: Page, timeout: number) {
  await page.goto('/dashboard/invoices/create');
  await expect(page.getByLabel('Choose customer')).toBeVisible({
    timeout,
  });
}

/**
 * Plan §6 C1: full happy-path create (same flow X1 relies on when the list is empty).
 */
export async function createHappyPathInvoice(page: Page, streamed: {
  timeout: number;
}) {
  await openCreateInvoice(page, streamed.timeout);

  await page.getByLabel('Choose customer').selectOption({ label: 'Evil Rabbit' });
  await page.getByLabel('Choose an amount').fill(String(HAPPY_PATH_DOLLARS));
  await page.getByRole('radio', { name: /^pending$/i }).check();

  await page.getByRole('button', { name: 'Create Invoice' }).click();

  await expect(page).toHaveURL(/\/dashboard\/invoices$/, { timeout: 30_000 });
  await expect
    .poll(
      async () => {
        await page.goto('/dashboard/invoices?page=1', {
          waitUntil: 'domcontentloaded',
        });
        return dataTable(page).locator('tbody tr').count();
      },
      { timeout: 45_000 },
    )
    .toBeGreaterThan(0);
  await expect(
    page.getByRole('columnheader', { name: 'Customer' }),
  ).toBeVisible(streamed);
}

/**
 * Plan §8 X1: delete the **newest** invoice row (first row — `fetchFilteredInvoices` order).
 * Setup runs C1 first so that row is the happy-path create; standalone X1 seeds via `createHappyPathInvoice` if the list is empty.
 */
export async function deleteNewestInvoiceRow(page: Page, streamed: {
  timeout: number;
}) {
  await page.goto('/dashboard/invoices?page=1', { waitUntil: 'load' });
  await expect(
    page.getByRole('columnheader', { name: 'Customer' }),
  ).toBeVisible(streamed);

  const rows = dataTable(page).locator('tbody tr');
  await expect.poll(() => rows.count(), { timeout: 30_000 }).toBeGreaterThan(0);

  const targetRow = rows.first();
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

  await page.goto('/dashboard/invoices?page=1', { waitUntil: 'load' });
  await expect(dataTable(page).locator(`tbody a[href="${href}"]`)).toHaveCount(
    0,
    { timeout: 30_000 },
  );
}
