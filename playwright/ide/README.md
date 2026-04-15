# IDE MCP config (canonical copies)

Cursor and VS Code only load MCP from **fixed paths at the repo root**:

| Root file (loaded by IDE) | Canonical copy here |
|----------------------------|---------------------|
| **`.cursor/mcp.json`** | [`cursor-mcp.json`](cursor-mcp.json) |
| **`.vscode/mcp.json`** | [`vscode-mcp.json`](vscode-mcp.json) |

After editing files in **`playwright/ide/`**, copy them to the root paths above (or keep them in sync) so the IDE picks up changes.

## Server names in `cursor-mcp.json`

| Key | Use case |
|-----|----------|
| **`playwright-mcp`** | [Browser MCP](https://playwright.dev/docs/getting-started-mcp) — AI drives Chromium from chat (accessibility snapshots). Optional for exploratory clicks / demos. |
| **`playwright-test-agents`** | [Playwright Test MCP](https://playwright.dev/docs/test-agents) — planner / generator / healer tools (`run-test-mcp-server`). Enable when using **Test Agents** with `seed.spec.ts` and `playwright/prompts/`. |

`vscode-mcp.json` only includes **`playwright-test-agents`** (VS Code / Copilot agent loop).
