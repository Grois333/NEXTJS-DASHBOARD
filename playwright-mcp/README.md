# Playwright MCP (Cursor)

This folder documents **optional** [Playwright MCP](https://playwright.dev/docs/getting-started-mcp) setup for **AI-driven browser control** in Cursor. It is **not** the same as your automated E2E suite (`pnpm test:e2e`).

| | **Playwright E2E** (`tests/e2e/`) | **Playwright MCP** |
|--|-------------------------------------|---------------------|
| **What** | Deterministic tests in CI and locally | Assistant uses MCP tools to drive a browser from **chat** |
| **How** | `pnpm test:e2e` | Natural-language **prompts** (see [`prompts/`](prompts/)) |
| **When** | Every PR / merge gate | Exploratory checks while coding |

Official docs: [Getting started — Playwright MCP](https://playwright.dev/docs/getting-started-mcp).

**MCP runs only what you describe in a prompt** — it does **not** run every file under `tests/e2e/`; for that use **`pnpm test:e2e`**.

**Local artifacts:** Playwright MCP may create **`.playwright-mcp/`** at the repo root (page snapshots `.yml`, console `.log`). That folder is **gitignored** — do not commit it; you can delete those files anytime.

## Prerequisites

- Node.js 18+
- App reachable at **`http://localhost:3000`** — run `pnpm dev` or `pnpm start` from the repo root first
- Cursor **MCP** enabled for this workspace

## Install in Cursor

1. **Project config (this repo)**  
   The repo includes **`.cursor/mcp.json`** with the Playwright MCP server (`npx -y @playwright/mcp@latest`).  
   Reload Cursor after pulling this branch so the server is picked up.

2. **If the server does not appear**  
   Manually: **Cursor Settings → MCP → Add new MCP server** → command type `npx @playwright/mcp@latest` (or paste the JSON from [`mcp-config.example.json`](mcp-config.example.json)).

3. **Confirm**  
   In MCP settings, **playwright** should show as connected. Node must be on your `PATH`.

There is **no separate `pnpm` script** required for normal use; the MCP client runs `npx` as configured.

## How to run the “login test” with MCP

MCP does **not** run `tests/e2e/login.spec.ts`. You **describe the same flow** in a prompt; the assistant uses MCP tools to navigate, click, and fill fields.

1. Start the app: `pnpm dev` (or `pnpm build && pnpm start`).
2. Open **Cursor chat** (Agent or appropriate mode that can use MCP tools).
3. Use a prompt like the examples in [`prompts/login-flow.md`](prompts/login-flow.md).

Default MCP browser is **headed** (you see the window). For headless or Firefox/WebKit, see the [official configuration options](https://playwright.dev/docs/getting-started-mcp).

## Optional: standalone MCP server

If headed mode misbehaves in your environment, you can run the server over HTTP and point Cursor at it — see **Standalone server** in the [same docs](https://playwright.dev/docs/getting-started-mcp).

## Security

- Treat chat like a **shared log**: avoid pasting production secrets.
- For CI and repeatable checks, **keep using** `pnpm test:e2e` and GitHub Actions, not MCP.
