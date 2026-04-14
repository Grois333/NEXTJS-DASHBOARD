# Playwright

- **`playwright.config.ts`** — browsers, mobile projects, `webServer`, reporters.
- **Tests** live in **`../tests/e2e/`** (repo root).

## Commands (from repo root)

These are npm scripts in **`package.json`** — use them instead of running `playwright test` by hand:

| Script | Command |
| --- | --- |
| E2E (headless; all projects: Chromium, Firefox, WebKit, mobile) | `pnpm test:e2e` |
| Playwright UI (headless browsers — no separate window for the site) | `pnpm test:e2e:ui` |
| Playwright UI + **headed desktop Chromium** — you see a real browser window while tests run | `pnpm test:e2e:ui:headed` |

Use **`pnpm test:e2e`** when you want the same breadth as CI. Use **`pnpm test:e2e:ui:headed`** when you want to **watch** the login flow locally without running every engine; other browsers still pass only when you run the full command above.

## Env

Set **`E2E_USER_EMAIL`** and **`E2E_USER_PASSWORD`** in **`.env`** (gitignored) — same names as GitHub Actions secrets for CI.
