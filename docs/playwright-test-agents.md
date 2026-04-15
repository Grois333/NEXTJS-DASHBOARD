# Playwright Test Agents (planner / generator / healer)

Official docs: [Playwright Test Agents](https://playwright.dev/docs/test-agents).

This repo was initialized with:

```bash
pnpm exec playwright init-agents --loop=vscode --config=playwright/playwright.config.ts --prompts
```

## What was added

| Path | Purpose |
|------|--------|
| `tests/e2e/seed.spec.ts` | **Seed** — logs in (uses `E2E_*` from `.env`) so agents start on the dashboard. Not a replacement for `login.spec.ts`. |
| `specs/` | **Test plans** (Markdown) — planner writes here, e.g. `specs/acme-dashboard.plan.md` after you run the planner. |
| `.github/agents/*.agent.md` | Agent definitions (planner, generator, healer). |
| `.github/prompts/*.prompt.md` | Prompt templates — edit `playwright-test-plan.prompt.md` to change what you ask the planner to cover. |
| `.vscode/mcp.json` | Same **Playwright Test MCP** for **VS Code** (created by `init-agents`). |
| **`.cursor/mcp.json`** | **Cursor** reads this file for MCP — includes both **`playwright`** (browser) and **`playwright-test`** (`run-test-mcp-server`) for agents. |

## How to “run the scan” (planner)

The planner does **not** run from a single CLI command like `pnpm scan`. It runs inside an **AI agent session** that has the **Playwright Test MCP** server:

1. **Install / enable MCP**  
   **Cursor:** use **`.cursor/mcp.json`** (both servers listed there). Reload Cursor after changes. **VS Code:** **`.vscode/mcp.json`**. Enable **`playwright-test`** in **Settings → Tools & MCP** so `npx playwright run-test-mcp-server` is available to agents.

2. **Start the app** — `pnpm dev` or `pnpm build && pnpm start` (Playwright config can start `pnpm start` for tests).

3. **Set `.env`** — `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` so `seed.spec.ts` can log in.

4. **Run the planner agent** (VS Code 1.105+ with GitHub Copilot agent experience, or your client’s equivalent):  
   Use the prompt in **`.github/prompts/playwright-test-plan.prompt.md`** (or copy its body) so the **playwright-test-planner** agent explores the app and calls `planner_save_plan` → Markdown under **`specs/`**.

5. **Generator / healer** — use **`.github/prompts/playwright-test-generate.prompt.md`** and **heal** prompts when you want code generated from the plan or failures fixed.

If your editor does not support the agent UI yet, you can still **manually** follow the plan format in the docs and write tests under `tests/e2e/`.

## Duplicate login tests?

- **`login.spec.ts`** — your **E2E test** for the login journey.  
- **`seed.spec.ts`** — **bootstrap only** for agents (same steps, different purpose). You can merge them later with a shared helper if you want less duplication.

## Regenerating agents after Playwright upgrades

```bash
pnpm exec playwright init-agents --loop=vscode --config=playwright/playwright.config.ts --prompts
```

Review diffs — agent definitions change with Playwright versions.
