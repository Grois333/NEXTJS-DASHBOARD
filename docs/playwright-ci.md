# Playwright E2E on GitHub Actions

The workflow **`.github/workflows/playwright.yml`** runs on **pull requests targeting `main`**.

Playwright is configured in **`playwright/playwright.config.ts`** (not the repo root).

## What you need in GitHub

Add these **repository secrets** (Settings → Secrets and variables → Actions):

| Secret               | Purpose |
|----------------------|---------|
| `POSTGRES_URL`       | Same Postgres connection string you use locally / on Vercel (app + auth need it). |
| `AUTH_SECRET`        | Same as local — `openssl rand -base64 32`. |
| `E2E_USER_EMAIL`     | **Required** for the login E2E test — must match a user in the DB CI uses. |
| `E2E_USER_PASSWORD`  | **Required** — plain-text password for that user (same as stored hashed in DB). |

Also set **`AUTH_URL`** in the workflow to `http://localhost:3000` (already in the YAML) so NextAuth matches the CI server URL.

## Database

The login test does **not** embed credentials in code. Whatever you set in **`E2E_USER_EMAIL`** / **`E2E_USER_PASSWORD`** must exist in the database behind **`POSTGRES_URL`** (e.g. seed once with **`GET /seed`** using the Learn course data, or use your own test user).

## Local runs

```bash
pnpm build
pnpm test:e2e
```

Playwright starts **`pnpm start`** automatically unless port 3000 is already in use (e.g. `pnpm dev`).

**Important:** use **`http://localhost:3000`** (not `127.0.0.1`) so cookies match NextAuth.

```bash
pnpm test:e2e:ui   # optional Playwright UI mode
```

## Artifacts

Failed (or completed) runs upload **`playwright-report/`** as a workflow artifact for 14 days — download from the Actions run page.
