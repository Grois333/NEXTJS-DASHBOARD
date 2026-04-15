# Playwright Test Agents (planner / generator / healer)

Official docs: [Playwright Test Agents](https://playwright.dev/docs/test-agents).

This repo was initialized with:

```bash
pnpm exec playwright init-agents --loop=vscode --config=playwright/playwright.config.ts --prompts
```

Agent and prompt files were moved under **`playwright/agents/`** and **`playwright/prompts/`** for a single Playwright home. If you re-run `init-agents`, review diffs — it may recreate **`.github/`** paths; merge into **`playwright/`** if needed.

## What was added

| Path | Purpose |
|------|--------|
| `tests/e2e/seed.spec.ts` | **Seed** — logs in (uses `E2E_*` from `.env`) so agents start on the dashboard. Not a replacement for `login.spec.ts`. |
| `specs/` | **Test plans** (Markdown) — planner writes here, e.g. `specs/acme-dashboard.plan.md` after you run the planner. |
| **`playwright/agents/*.agent.md`** | Agent definitions (planner, generator, healer). |
| **`playwright/prompts/*.prompt.md`** | Prompt templates — edit `playwright-test-plan.prompt.md` to change what you ask the planner to cover. |
| **`playwright/ide/vscode-mcp.json`** | Canonical **VS Code** MCP (copy to **`.vscode/mcp.json`** at root). |
| **`playwright/ide/cursor-mcp.json`** | Canonical **Cursor** MCP (copy to **`.cursor/mcp.json`** at root). See **`playwright/ide/README.md`**. |

## How to “run the scan” (planner)

The planner does **not** run from a single CLI command like `pnpm scan`. It runs inside an **AI agent session** that has the **Playwright Test MCP** server:

1. **Install / enable MCP**  
   **Cursor:** **`.cursor/mcp.json`** (see **`playwright/ide/cursor-mcp.json`**). **VS Code:** **`.vscode/mcp.json`**. In **Settings → Tools & MCP**, enable **`playwright-test-agents`** (Playwright Test MCP / `run-test-mcp-server`) for planner / generator / healer. Optionally enable **`playwright-mcp`** for browser-only exploration — separate from agents.

2. **Start the app** — `pnpm dev` or `pnpm build && pnpm start` (Playwright config can start `pnpm start` for tests).

3. **Set `.env`** — `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` so `seed.spec.ts` can log in.

4. **Run the planner agent** (VS Code 1.105+ with GitHub Copilot agent experience, or your client’s equivalent):  
   Use the prompt in **`playwright/prompts/playwright-test-plan.prompt.md`** (or copy its body) so the **playwright-test-planner** agent explores the app and calls `planner_save_plan` → Markdown under **`specs/`**.

5. **Generator** — **after** the plan file exists, open **`playwright/prompts/playwright-test-generate.prompt.md`**. You usually generate **one scenario at a time** (e.g. “section 1.1 from `specs/acme-dashboard.plan.md`”), not the whole plan in one shot, unless your agent supports a bulk “coverage” flow.

6. **Healer** (optional) — use **`playwright/prompts/playwright-test-heal.prompt.md`** so failing generated tests get fixed iteratively.

**Order:** **Planner** → review **`specs/*.plan.md`** → **Generator** per scenario → optional **Healer**.

If your editor does not support the agent UI yet, you can still **manually** follow the plan format in the docs and write tests under `tests/e2e/`.

## Duplicate login tests?

- **`login.spec.ts`** — your **E2E test** for the login journey.  
- **`seed.spec.ts`** — **bootstrap only** for agents (same steps, different purpose). You can merge them later with a shared helper if you want less duplication.

## Regenerating agents after Playwright upgrades

```bash
pnpm exec playwright init-agents --loop=vscode --config=playwright/playwright.config.ts --prompts
```

Review diffs — agent definitions change with Playwright versions. Merge new files into **`playwright/agents/`** and **`playwright/prompts/`** if `init-agents` writes under **`.github/`** again.
