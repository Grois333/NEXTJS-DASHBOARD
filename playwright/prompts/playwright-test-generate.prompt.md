---
agent: playwright-test-generator
description: Generate Playwright tests from a plan section
---

Use the **Markdown test plan** produced by the planner (default: **`specs/acme-dashboard.plan.md`**).

Pick **one** scenario block from that file (e.g. section **1.1**, **1.2**, …) and generate a matching test file under **`tests/e2e/`**.

- Seed file (for imports / setup reference): `tests/e2e/seed.spec.ts`
- Test plan: `specs/acme-dashboard.plan.md`

**Example request to the generator agent:**  
“Generate tests for scenario **1.1** from `specs/acme-dashboard.plan.md` using seed `tests/e2e/seed.spec.ts`, save under `tests/e2e/…`.”

Repeat for other scenarios **one at a time** (or run the **healer** after a batch). Skip any plan section that duplicates **`login.spec.ts`** if you do not want a second login test file.
