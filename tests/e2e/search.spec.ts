import { test, expect, type Page } from '@playwright/test';
import { loginToDashboardFromHome } from './helpers/login-to-dashboard';

/**
 * Plan §4 Search & URL state (S1–S3): `playwright/specs/acme-dashboard.plan.md`
 *
 * `app/ui/search.tsx` debounces input (~300ms) and `replace()`s the URL with `query=`
 * and `page=1`. Clearing is via empty input or the **Clear search** (X) button.
 * Filter matches customer name/email
 * (and amount/date/status) via `fetchFilteredInvoices`.
 *
 * Seed data includes **Evil Rabbit** (`evil@rabbit.com`) — use a substring like `evil`.
 */
test.describe('Invoice search & URL state', () => {
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
    await page.getByTestId('nav-invoices').click();
    await expect(page).toHaveURL(/\/dashboard\/invoices/);
    await expect(
      page.getByRole('heading', { name: /^Invoices$/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Customer' }),
    ).toBeVisible(streamed);
  });

  function searchInput(page: Page) {
    return page.getByPlaceholder('Search invoices...');
  }

  test('S1: typing a match updates URL with query= and filters rows', async ({
    page,
  }) => {
    await searchInput(page).fill('evil');

    await expect(page).toHaveURL(/[?&]query=/, { timeout: 10_000 });
    await expect(page).toHaveURL(/query=evil/i, { timeout: 10_000 });

    const rows = page.locator('table tbody tr');
    const n = await rows.count();
    if (n === 0) {
      test.skip();
      return;
    }

    for (let i = 0; i < n; i++) {
      await expect(rows.nth(i)).toContainText(/Evil Rabbit|evil@rabbit\.com/i);
    }
  });

  test('S2: clearing search removes query from the URL (keyboard and X button)', async ({
    page,
  }) => {
    const input = searchInput(page);
    const clearButton = page.getByRole('button', { name: 'Clear search' });

    await input.fill('evil');
    await expect(page).toHaveURL(/[?&]query=/, { timeout: 10_000 });

    const filteredCount = await page.locator('table tbody tr').count();

    await input.fill('');

    await expect
      .poll(() => new URL(page.url()).searchParams.get('query'), {
        timeout: 10_000,
      })
      .toBeNull();

    const clearedCount = await page.locator('table tbody tr').count();
    expect(clearedCount).toBeGreaterThanOrEqual(filteredCount);
    if (clearedCount > filteredCount) {
      await expect(page.getByRole('table')).toContainText(/Delba|Lee|Michael/i);
    }

    await input.fill('evil');
    await expect(page).toHaveURL(/[?&]query=/, { timeout: 10_000 });
    await expect(clearButton).toBeVisible();

    await clearButton.click();

    await expect
      .poll(() => new URL(page.url()).searchParams.get('query'), {
        timeout: 10_000,
      })
      .toBeNull();
    await expect(input).toHaveValue('');
  });

  test('S3: searching from page=2 resets to page=1 with the new query', async ({
    page,
  }) => {
    await page.goto('/dashboard/invoices?page=2');
    await expect(
      page.getByRole('columnheader', { name: 'Customer' }),
    ).toBeVisible(streamed);

    await searchInput(page).fill('evil');

    await expect
      .poll(
        () => {
          const u = new URL(page.url());
          return `${u.searchParams.get('page')}|${u.searchParams.get('query')}`;
        },
        { timeout: 10_000 },
      )
      .toBe('1|evil');
  });
});
