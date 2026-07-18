# Test Strategy

## Test Scope

### In scope (configured today)

| Area | Coverage |
|------|----------|
| Backend unit | Pure state-machine logic (`tests/unit/statusTransitions.test.js`) — no DB required |
| Backend HTTP smoke | `GET /health` via Supertest |
| Backend integration harness | Jest configured in `src/backend/package.json`; tests live in `tests/` at repo root |
| Auth integration | Login, register, refresh, logout, profile, password validation |
| Ticket integration | CRUD, comments, keyword search, status filter, status state machine, `resolvedAt` |
| RBAC integration | Customer isolation, rep scoping, permissions, admin route protection |
| Admin integration | Representatives, customers, deactivation |
| Dashboard integration | Admin and role-scoped stats |
| Ticket assignment | Auto-assign on customer create, rep `canCreateTickets`, customer list endpoint |

### Out of scope / not implemented

| Area | Status |
|------|--------|
| Frontend unit/component tests | No test runner configured in `src/frontend/` |
| E2E browser tests | None |
| Broader backend unit tests | Only `statusTransitions.js` has a dedicated unit suite; other helpers are still covered via integration |

---

## Unit Tests

**Location:** `tests/unit/statusTransitions.test.js`

The status state machine is pure logic, so it gets a dedicated, database-free unit suite covering `getAllowedTransitions` and `isValidTransition`: every required valid path, representative invalid paths (including `resolved → open` and terminal reopens), no-op transitions, unknown statuses, and an invariant check that all configured targets are known statuses.

Other backend helpers remain covered indirectly through the integration suites; broadening isolated unit coverage is a future improvement.

---

## Component Tests

**None.** React components are validated manually across admin, rep, and customer flows.

---

## API Integration Tests

**Location:** `tests/*.integration.js` (8 files)

**Framework:** Jest + Supertest; `app` imported from `src/backend/app.js` (no live server required).

**Helpers:** `tests/setup.js`, `tests/helpers/testApi.js`

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

See `test-results.md` for the latest run output.

---

## Edge Case Tests

| Behavior | Test coverage |
|----------|---------------|
| Invalid status transitions | `ticket-status-transitions.integration.js` |
| Terminal status rejection | `ticket-status-transitions.integration.js` |
| Customer cannot access others' tickets | `ticket-rbac.integration.js` |
| Customer list filter | `ticket-rbac.integration.js` |
| Deactivated user blocked at login | `admin.integration.js` |
| `resolvedAt` set/cleared on status change | `ticket-status-transitions.integration.js` |
| MSSQL permissions JSON as string | Fixed in `User.js`; covered by RBAC tests |
| Concurrent 401 refresh deduplication | Manual only (`api/client.js`) |

---

## How to run

From repo root:

```bash
npm test
```

Equivalent to `npm test --prefix src/backend` → `jest --runInBand`.

**Requirements:** Configured `src/backend/.env`, migrated schema, and seeded data. All suites except health check require database connectivity.

---

## Remaining gaps (honest)

1. **Frontend** — no automated component or E2E tests
2. **Unit tests** — only the status state machine has a dedicated unit suite; other pure helpers are covered via integration
3. **Customer portal** — search/filter UI not implemented (admin/rep list has filters; API supports both)
4. **Load / performance** — not tested
