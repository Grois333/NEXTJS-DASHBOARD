# Playwright

Everything Playwright-related for this repo lives **under this folder**, except:

- **`.cursor/mcp.json`** and **`.vscode/mcp.json`** at the **repo root** (Cursor/VS Code only load MCP from there). **Canonical copies:** [`ide/cursor-mcp.json`](ide/cursor-mcp.json) and [`ide/vscode-mcp.json`](ide/vscode-mcp.json) — see [`ide/README.md`](ide/README.md).
- **`tests/e2e/`** — test files at repo root (Playwright convention).
- **`.github/workflows/playwright.yml`** — CI workflow file.

## Layout

| Path | Purpose |
|------|--------|
| [`playwright.config.ts`](playwright.config.ts) | Browsers, `webServer`, reporters |
| [`ide/`](ide/) | MCP JSON **canonical** copies + notes for Cursor / VS Code |
| [`mcp/`](mcp/) | Docs for **browser** Playwright MCP (`@playwright/mcp`) |
| [`agents/`](agents/) | Test **Agents** definitions (planner, generator, healer) |
| [`prompts/`](prompts/) | Prompt templates for those agents |
| [`CI.md`](CI.md) | GitHub Actions / secrets |
| [`TEST-AGENTS.md`](TEST-AGENTS.md) | Planner → generator → healer workflow |

Run commands below from the **repository root** with **pnpm** so Playwright uses this project’s config and `node_modules/.bin`.

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

## Related docs (hub)

| Topic | Doc |
| --- | --- |
| **CI** (GitHub Actions, secrets) | [`CI.md`](CI.md) |
| **Playwright MCP** (Cursor — optional browser tooling for AI) | [`mcp/README.md`](mcp/README.md) |
| **Test Agents** (planner / generator / healer, `seed.spec.ts`) | [`TEST-AGENTS.md`](TEST-AGENTS.md) |
