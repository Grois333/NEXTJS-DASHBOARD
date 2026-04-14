# Next.js App Router — Dashboard

Dashboard app from the [Next.js Learn](https://nextjs.org/learn) App Router course.

## Live demo

**Production (Vercel):** [nextjs-invoice-dashbaord.vercel.app](https://nextjs-invoice-dashbaord.vercel.app/)

## Preview

![Acme dashboard — home view with revenue chart and latest invoices](docs/dashboard-preview.png)

## E2E tests (Playwright)

Scripts are defined in **`package.json`**. **Run them from the repo root** with pnpm so Playwright uses this project’s config and local CLI (avoid typing bare `playwright test`, which can pick another tool on your `PATH`).

| What | Command |
| --- | --- |
| Headless / terminal reporter (all browsers in config) | `pnpm test:e2e` |
| Playwright UI — debug, traces, pick tests (headless; no desktop browser window) | `pnpm test:e2e:ui` |
| Playwright UI + **visible Chromium** — watch the app while tests run (faster local feedback; still only **desktop Chrome**) | `pnpm test:e2e:ui:headed` |

Full CI-style coverage uses **`pnpm test:e2e`** (Firefox, WebKit, mobile, etc.). The **headed** script is optional and **Chromium-only** so you can see clicks and navigation in a real window without opening five browsers.

First-time or after app changes, a production build matches what CI runs:

```bash
pnpm build && pnpm test:e2e
```

Set **`E2E_USER_EMAIL`** and **`E2E_USER_PASSWORD`** in **`.env`** (see `playwright/README.md`). CI runs on pull requests to `main`; configure GitHub Actions secrets as in [docs/playwright-ci.md](docs/playwright-ci.md).

## Learn more

See the [course curriculum](https://nextjs.org/learn) on the Next.js site.
