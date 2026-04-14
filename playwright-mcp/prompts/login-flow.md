# Example prompts — login flow (matches `tests/e2e/login.spec.ts`)

Use these in **Cursor chat** with the **Playwright MCP** server enabled and the app running on `http://localhost:3000`.

**Do not paste real production passwords into chat.** Use the same test user as in your local `.env` (`E2E_USER_EMAIL` / `E2E_USER_PASSWORD`) only if you are comfortable; prefer typing credentials yourself in the browser if the assistant would log them.

## Prompt A — one block

```text
Open http://localhost:3000 in the browser. Click the Log in link. On the login page, fill Email and Password using my test credentials (I'll type them in chat in the next message if needed), click Log in, then confirm the URL is /dashboard and a heading contains "Dashboard".
```

## Prompt B — step style

```text
1. Go to http://localhost:3000
2. Click "Log in"
3. On /login, fill the email and password fields and submit the form
4. Verify we land on /dashboard and the dashboard is visible
```

The MCP server drives the browser via **accessibility snapshots** (see [Playwright MCP](https://playwright.dev/docs/getting-started-mcp)); it does not execute the `login.spec.ts` file automatically.
