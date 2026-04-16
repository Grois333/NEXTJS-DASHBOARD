import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Auth.js session cookies (see `@auth/core` defaultCookies): `authjs.session-token` and optional
 * `authjs.session-token.0` chunks; with HTTPS, `__Secure-authjs.session-token`.
 *
 * After `signOut`, navigation to `/` can complete before the browser applies cookie deletion on some
 * engines (Firefox / WebKit / Mobile Safari in CI). Poll until the session cookie is gone, then
 * assert `/dashboard` redirects to `/login`.
 */
function hasAuthJsSessionCookie(cookies: { name: string }[]) {
  return cookies.some((c) =>
    /^(?:__Secure-)?authjs\.session-token(?:\.\d+)?$/.test(c.name),
  );
}

export async function waitForAuthJsSessionCleared(page: Page) {
  const origin = new URL(page.url()).origin;
  const cookieUrl = `${origin}/`;

  await expect
    .poll(
      async () => {
        const cookies = await page.context().cookies(cookieUrl);
        return !hasAuthJsSessionCookie(cookies);
      },
      {
        timeout: 30_000,
        intervals: [100, 200, 400, 800],
        message:
          'Expected Auth.js session cookie to be removed after sign out (wait before visiting /dashboard).',
      },
    )
    .toBe(true);
}
