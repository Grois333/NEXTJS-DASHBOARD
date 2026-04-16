import { test, expect, type Page } from '@playwright/test';
import { loginToDashboardFromHome } from './helpers/login-to-dashboard';

/**
 * Plan §5 Pagination (P1–P3): `playwright/specs/acme-dashboard.plan.md`
 *
 * **Search vs page:** typing in the search box always sets `page=1` (see `app/ui/search.tsx`).
 * If you were on page 3 and run a new search, the URL correctly becomes `page=1` with the new
 * `query` — that is intentional. Pagination links preserve `query` when moving between pages
 * (`createPageURL` in `app/ui/invoices/pagination.tsx`).
 *
 * P1/P3 skip when the filtered list fits on one page (fixture-dependent).
 */
test.describe('Invoice pagination', () => {
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

  /** Wrapper around the invoice list pagination control (centered under the table). */
  function invoicePagination(page: Page) {
    return page.locator('div.mt-5.flex.w-full.justify-center .inline-flex').first();
  }

  test('P1: multi-page list can open page 2', async ({ page }) => {
    const page2 = page.getByRole('link', { name: '2', exact: true });
    if ((await page2.count()) === 0) {
      test.skip();
      return;
    }

    await page2.click();

    await expect(page).toHaveURL(/[?&]page=2/);
    await expect
      .poll(() => new URL(page.url()).searchParams.get('page'))
      .toBe('2');
  });

  test('P2: previous disabled on page 1; next disabled on last page when multi-page', async ({
    page,
  }) => {
    const pag = invoicePagination(page);

    await expect(page).not.toHaveURL(/[?&]page=[2-9]/);
    const pageParam = new URL(page.url()).searchParams.get('page');
    expect(pageParam === null || pageParam === '1').toBeTruthy();

    const prev = pag.locator('> *').first();
    await expect(prev.locator('a')).toHaveCount(0);

    const page2 = page.getByRole('link', { name: '2', exact: true });
    if ((await page2.count()) === 0) {
      return;
    }

    const numberLinks = page.locator('div.mt-5').getByRole('link', {
      name: /^[0-9]+$/,
    });
    const n = await numberLinks.count();
    let lastPage = 1;
    for (let i = 0; i < n; i++) {
      lastPage = Math.max(lastPage, Number(await numberLinks.nth(i).innerText()));
    }

    await page.goto(`/dashboard/invoices?page=${lastPage}`);
    await expect(
      page.getByRole('columnheader', { name: 'Customer' }),
    ).toBeVisible(streamed);

    const pagLast = invoicePagination(page);
    const next = pagLast.locator('> *').last();
    await expect(next.locator('a')).toHaveCount(0);
  });

  test('P3: with search active, pagination keeps query in the URL', async ({
    page,
  }) => {
    const input = page.getByPlaceholder('Search invoices...');
    await input.fill('e');
    await expect
      .poll(() => new URL(page.url()).searchParams.get('query'), {
        timeout: 10_000,
      })
      .toBe('e');

    const page2 = page.getByRole('link', { name: '2', exact: true });
    if ((await page2.count()) === 0) {
      test.skip();
      return;
    }

    await expect(page2).toHaveAttribute(
      'href',
      /[?&]query=e/,
    );

    await page2.click();

    await expect
      .poll(
        () => {
          const u = new URL(page.url());
          return `${u.searchParams.get('query')}|${u.searchParams.get('page')}`;
        },
        { timeout: 10_000 },
      )
      .toBe('e|2');

    const next = invoicePagination(page).locator('> *').last();
    if ((await next.locator('a').count()) > 0) {
      await expect(next.locator('a').first()).toHaveAttribute(
        'href',
        /[?&]query=e/,
      );
    }
  });
});
