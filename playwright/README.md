# Playwright

- **`playwright.config.ts`** — browsers, mobile projects, `webServer`, reporters.
- **Tests** live in **`../tests/e2e/`** (repo root).

Run everything below from the **repository root** with **pnpm** so Playwright uses this project’s config and `node_modules/.bin` (typing bare `playwright test` can resolve a different install on your `PATH`).

## Commands

Scripts live in **`package.json`** — prefer them over invoking `playwright` directly:

| Script | Command |
| --- | --- |
| E2E (headless; all projects: Chromium, Firefox, WebKit, mobile) | `pnpm test:e2e` |
| Playwright UI (headless browsers — no separate window for the site) | `pnpm test:e2e:ui` |
| Playwright UI + **headed desktop Chromium** — you see a real browser window while tests run | `pnpm test:e2e:ui:headed` |

Use **`pnpm test:e2e`** when you want the same breadth as CI. Use **`pnpm test:e2e:ui:headed`** when you want to **watch** the login flow locally without running every engine; other browsers still pass only when you run the full command above.

## Env

Set **`E2E_USER_EMAIL`** and **`E2E_USER_PASSWORD`** in **`.env`** (gitignored) — same names as GitHub Actions secrets for CI.

## Test Agents (planner / generator / healer)

Optional **Playwright Test Agents** (AI-assisted plans and generated tests): [`docs/playwright-test-agents.md`](../docs/playwright-test-agents.md). Includes **`tests/e2e/seed.spec.ts`** for agent bootstrap (separate from **`login.spec.ts`**).
