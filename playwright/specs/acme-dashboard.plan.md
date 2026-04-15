# Acme invoice dashboard — E2E test plan

Regression-focused test plan for the **Next.js Learn** Acme dashboard (`app/dashboard/*`, invoices CRUD, NextAuth). Cosmetic checks are omitted unless they block a flow.

## Prerequisites

| Item | Notes |
|------|--------|
| **Seed / known state** | `tests/e2e/seed.spec.ts` — navigates `/` → login → `/dashboard`. Requires `E2E_USER_EMAIL` and `E2E_USER_PASSWORD`. |
| **DB** | Invoice CRUD hits Postgres (`POSTGRES_URL`). CI/local must have a DB seeded with course schema + sample data so list/search/pagination behave predictably. |
| **Overlap with existing tests** | `tests/e2e/login.spec.ts` already covers **home → login → dashboard** and heading visibility. New tests should **not** duplicate that full login journey unless a scenario needs a fresh context (e.g. storage state per test). Prefer `storageState` or `beforeEach` login only where isolation requires it. |

## Application map (routes under test)

| Route | Behavior |
|-------|----------|
| `/` | Marketing home; “Log in” → `/login`. |
| `/login` | Email/password form (`authenticate` / NextAuth credentials). |
| `/dashboard` | Overview: cards, revenue chart, latest invoices (`app/dashboard/(overview)/page.tsx`). |
| `/dashboard/invoices` | Invoice list, **search** (`query`), **pagination** (`page`), create button, table actions (`app/dashboard/invoices/page.tsx`). |
| `/dashboard/invoices/create` | Create form: customer, amount, status (pending/paid) (`create-form.tsx`). Success → redirect to `/dashboard/invoices`. |
| `/dashboard/invoices/[id]/edit` | Edit form; missing id → `notFound()` (`[id]/edit/page.tsx`). |
| `/dashboard/customers` | Placeholder: static “Customers Page” (`app/dashboard/customers/page.tsx`) — **smoke only**. |

**Auth** (`auth.config.ts` + `proxy.ts`): `/dashboard*` requires session; logged-in users visiting `/` or `/login` are redirected to `/dashboard`. Side nav includes **Sign Out** (`signOut` → `/`).

---

## 1. Navigation (side nav + shell)

| ID | Scenario | Steps | Expected |
|----|-----------|-------|----------|
| N1 | Home (dashboard) | From any dashboard page, click side nav **Home** (visible text on `md+`; icon-only on small screens — use `href` or accessible name). | URL `/dashboard`; main heading **Dashboard** visible. |
| N2 | Invoices | Click **Invoices**. | URL `/dashboard/invoices`; **Invoices** heading visible. |
| N3 | Customers | Click **Customers**. | URL `/dashboard/customers`; placeholder content visible. |
| N4 | Logo | Click Acme logo in side nav. | Navigates to `/` (marketing). |
| N5 | Sign out | From dashboard, **Sign Out**. | Lands on `/`; subsequent visit to `/dashboard` requires login (see **Auth**). |

**Regression value:** Ensures layout + `NavLinks` routes and sign-out stay wired after refactors.

---

## 2. Dashboard overview

| ID | Scenario | Steps | Expected |
|----|-----------|-------|----------|
| D1 | Overview loads | Open `/dashboard` (authenticated). | Heading **Dashboard**; overview regions render (cards area, chart area, latest invoices — no strict pixel checks). |
| D2 | Data presence | If seed DB includes revenue/latest data, assert at least one non-empty list/chart container or known label from `LatestInvoices` / cards. | No empty shell due to broken data fetch (adjust assertions to match stable seed fixtures). |

Skip detailed chart pixel or animation checks.

---

## 3. Invoice list

| ID | Scenario | Steps | Expected |
|----|-----------|-------|----------|
| L1 | Table structure | On `/dashboard/invoices` at `md` or `lg` viewport. | Table shows columns **Customer**, **Email**, **Amount**, **Date**, **Status**; rows show customer image + name. |
| L2 | Mobile layout | Narrow viewport. | Stacked cards (`md:hidden` branch) show same invoice data + actions. |
| L3 | Create entry point | Click **Create Invoice** (full label on `md+`). | Navigates to `/dashboard/invoices/create`. |
| L4 | Row actions present | For a known invoice row. | **Update** (pencil → edit URL) and **Delete** (trash, form submit) controls exist. |

---

## 4. Search & URL state

Search is debounced (~300ms) and updates `?query=`; clearing search removes `query`. Changing search sets `page=1` (`app/ui/search.tsx`).

| ID | Scenario | Steps | Expected |
|----|-----------|-------|----------|
| S1 | Filter by text | Type a substring matching a seeded customer or email; wait for debounce. | URL contains `query=`; table shows matching rows only (or empty state if no match). |
| S2 | Clear search | Clear the search input; wait. | `query` removed from URL; full list returns. |
| S3 | Search resets page | Go to `?page=2` (if valid), then search. | URL shows `page=1` with new `query`. |

---

## 5. Pagination

Pagination preserves `query` when building page links (`app/ui/invoices/pagination.tsx`).

| ID | Scenario | Steps | Expected |
|----|-----------|-------|----------|
| P1 | Multi-page | With seed data producing `totalPages > 1`, go to page 2. | URL `page=2`; different rows or empty tail as per data. |
| P2 | Prev disabled | On `page=1`. | Previous control disabled or no regress to invalid page. |
| P3 | With search | `?query=foo&page=1`, then next page if available. | `query` preserved in pagination links. |

If the environment always has a single page, mark P1/P3 conditional on fixture volume.

---

## 6. Create invoice

Form: **Choose customer** (`customerId`), **amount** (number > 0), **status** (radio `pending` | `paid`). Cancel → `/dashboard/invoices`. Submit → `createInvoice` → redirect to `/dashboard/invoices` (`app/lib/actions.ts`).

| ID | Scenario | Steps | Expected |
|----|-----------|-------|----------|
| C1 | Happy path | Select a customer, enter valid amount, pick status, submit. | Redirect to invoice list; new row appears with expected amount/status (formatting may use `formatCurrency` / status badge). |
| C2 | Validation — empty | Submit with empty customer / amount / status. | Inline errors (Zod); no navigation; messages like “Please select a customer.” / amount / status errors. |
| C3 | Cancel | Click **Cancel**. | `/dashboard/invoices` without creating. |

Optional: invalid amount (0 or negative) per schema.

---

## 7. Edit invoice

| ID | Scenario | Steps | Expected |
|----|-----------|-------|----------|
| E1 | Open editor | From list, click update for a known `id`. | URL `/dashboard/invoices/{id}/edit`; form fields reflect existing invoice (`defaultValue` for customer, amount, status). |
| E2 | Happy path | Change amount or status (or customer), submit. | Redirect to `/dashboard/invoices`; list reflects update. |
| E3 | Invalid id | Request `/dashboard/invoices/nonexistent-id/edit`. | Next.js **404** (`notFound`). |

---

## 8. Delete invoice

| ID | Scenario | Steps | Expected |
|----|-----------|-------|----------|
| X1 | Delete | Click delete on a disposable test invoice (create in same test or use dedicated fixture id). | Row disappears after reload or list refresh; `DELETE` + `revalidatePath` path works. |

Use an invoice created in-test or a CI-only seed id to avoid destroying shared fixtures.

---

## 9. Customers

| ID | Scenario | Steps | Expected |
|----|-----------|-------|----------|
| CU1 | Placeholder | Navigate to **Customers**. | Page shows **Customers Page** (current implementation). No CRM flows until the page is built out. |

---

## 10. Auth boundaries

Align with `auth.config.ts` callbacks and `proxy.ts` matcher (non-static routes protected).

| ID | Scenario | Steps | Expected |
|----|-----------|-------|----------|
| A1 | Unauthenticated dashboard | Clear session / new context; `goto /dashboard`. | Redirect to `/login` (or course-equivalent sign-in page). |
| A2 | Authenticated root | Logged in; `goto /` or `/login`. | Redirect to `/dashboard`. |
| A3 | Post sign-out | After N5, `goto /dashboard`. | Must authenticate again (A1). |

Invalid login messaging is covered by unit/integration or separate negative login tests; optional E2E: wrong password shows error from `authenticate` (**Invalid credentials.**).

---

## 11. Suggested execution order (per file or suite)

1. Auth smoke (A1–A2) or rely on `login.spec` + storage state.  
2. Navigation (N1–N5).  
3. Dashboard (D1–D2).  
4. Invoices list + search + pagination (L*, S*, P*).  
5. Create → list → edit → delete (C*, E*, X*) using isolated data.  
6. Customers (CU1).  
7. 404 edit (E3).

---

## Out of scope (unless product-critical)

- Visual regression of charts, hero images, fonts.  
- Exact currency/date string matching across locales.  
- API contract tests (prefer Playwright against real app + DB).  
- Full duplicate of `login.spec.ts` happy path in every file.

---

## Traceability

| Area | Primary code |
|------|----------------|
| Nav / layout | `app/ui/dashboard/sidenav.tsx`, `nav-links.tsx`, `app/dashboard/layout.tsx` |
| Invoices page | `app/dashboard/invoices/page.tsx`, `app/ui/search.tsx`, `app/ui/invoices/table.tsx`, `pagination.tsx`, `buttons.tsx` |
| Forms / actions | `app/ui/invoices/create-form.tsx`, `edit-form.tsx`, `app/lib/actions.ts` |
| Auth | `auth.config.ts`, `auth.ts`, `proxy.ts`, `app/login/page.tsx` |
| Seed reference | `tests/e2e/seed.spec.ts` |
