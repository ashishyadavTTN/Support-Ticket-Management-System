# Test Strategy

## Test Scope

### In scope (configured today)

| Area | Coverage |
|------|----------|
| Backend unit | `tests/unit/statusTransitions.test.js`, `tests/unit/formatTicketId.test.js` |
| Backend HTTP smoke | `GET /health` via Supertest |
| Backend integration harness | Jest in `src/backend/package.json`; tests in repo-root `tests/` |
| Auth integration | Login, register, refresh, logout, profile, password validation |
| Ticket integration | CRUD, field updates, comments, keyword search, status filter, state machine, `resolvedAt` |
| Attachments | Image upload on create/comment, fetch, validation |
| RBAC integration | Customer isolation, rep scoping, permissions, admin route protection |
| Admin / dashboard / assignment | Rep management, stats, auto-assign |

### Out of scope / not implemented

| Area | Status |
|------|--------|
| Frontend unit/component tests | Vitest + React Testing Library in `src/frontend/` (`npm run test:frontend`) |
| E2E browser tests | None |
| Broader backend unit tests | Other helpers covered via integration |

---

## Unit Tests

**Location:** `tests/unit/`

- **`statusTransitions.test.js`** — valid Core paths, invalid paths (including `resolved → open` and terminal reopens), no-ops, unknown statuses
- **`formatTicketId.test.js`** — short display formatting for UUID ticket ids

---

## Component Tests

**Location:** `src/frontend/src/**/*.test.{js,jsx}`  
**Runner:** Vitest + React Testing Library (`npm run test:frontend`)

| Area | Coverage |
|------|----------|
| `LoginPage` | Client validation, successful login redirect, API error alert |
| `TicketFilterBar` | Admin-only assignee filter, search forwarding, status chips / clear |
| `StatusFilterDropdown` | Multi-select status options |
| `ErrorState` | Message + retry callback |
| Utils / constants | `validation`, `formatTicketId`, frontend status-transition helpers |

---

## API Integration Tests

**Location:** `tests/*.integration.js` (9 files) + 2 unit files → **11 suites / 85 tests** (see `test-results.md`)

**Framework:** Jest + Supertest; `app` from `src/backend/app.js`.

**Status machine coverage** (`ticket-status-transitions.integration.js`):

| Case | Expected |
|------|----------|
| `open → in_progress → resolved → closed` | 200 |
| `open → cancelled` | 200 |
| `in_progress → cancelled` | 200 |
| `open → closed` | 400 |
| `resolved → open` | 400 |
| `closed → open`, `cancelled → open` | 400 |
| Customer calls status endpoint | 403 |
| Missing ticket | 404 |
| `resolvedAt` set/cleared | Verified |

**Filter coverage** (`ticket-crud.integration.js`):

- Keyword search (`?search=password`)
- Status filter (`?status=open`)

---

## Edge Case Tests

| Behavior | Test coverage |
|----------|---------------|
| Invalid / terminal status transitions | `ticket-status-transitions.integration.js` |
| Customer cannot access others' tickets | `ticket-rbac.integration.js` |
| Deactivated user blocked at login | `admin.integration.js` |
| Attachment validation / access | `ticket-attachments.integration.js` |
| MSSQL permissions JSON as string | Fixed in `User.js`; covered by RBAC tests |
| Concurrent 401 refresh deduplication | Manual only (`api/client.js`) |

---

## How to run

```bash
npm test
```

**Requirements:** Configured `src/backend/.env`, migrated schema, and seeded data.

---

## Remaining gaps (honest)

1. **E2E** — no Playwright/Cypress browser suite
2. **Broader unit tests** — many backend helpers still integration-only
3. **Load / performance** — not tested
