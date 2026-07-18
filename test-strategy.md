# Test Strategy



## Test Scope



### In scope (configured today)

| Area | Coverage |
|------|----------|
| Backend HTTP smoke | `GET /health` via Supertest |
| Backend integration harness | Jest configured in `src/backend/package.json`; tests live in `tests/` at repo root |
| Auth integration | Login, register, refresh, logout, profile, password validation |
| Ticket integration | CRUD, comments, search, status state machine, `resolvedAt` |
| RBAC integration | Customer isolation, rep scoping, permissions, admin route protection |
| Admin integration | Representatives, customers, deactivation |
| Dashboard integration | Admin and role-scoped stats |



### Out of scope / not implemented

| Area | Status |
|------|--------|
| Frontend unit/component tests | No test runner configured in `src/frontend/` |
| E2E browser tests | None |



---



## Unit Tests



**None.** Business logic is exercised indirectly through controllers; no isolated unit test files exist for `statusTransitions.js`, `dashboardStats.js`, or `userHelpers.js`.



---



## Component Tests



**None.** React components are not covered by automated tests.



---



## API Integration Tests

**Location:** `tests/*.integration.js` (7 files, 45 tests)

**Framework:** Jest + Supertest; `app` imported from `src/backend/app.js` (no live server required).

**Helpers:** `tests/setup.js`, `tests/helpers/testApi.js`

**Currently implemented:** All suites pass — see `test-results.md` for the latest run.



---



## Edge Case Tests (planned / gaps)



These behaviors exist in code but lack dedicated tests:



| Behavior | Where enforced |

|----------|----------------|

| Invalid status transitions | `updateTicketStatus` |

| Customer cannot access others' tickets | `assertTicketAccess` |

| Customer list filter | `buildTicketListFilter` |

| Deactivated user rejected at login/refresh | `authController`, `authenticate` |

| `resolvedAt` set/cleared on status change | `updateTicketStatus` |

| Concurrent 401 refresh deduplication | Frontend `api/client.js` (manual testing only) |



---



## How to run



From repo root:



```bash

npm test

```



Equivalent to `npm test --prefix src/backend` → `jest --runInBand`.



**Requirements:** Tests that hit the database (when written) will need a configured `src/backend/.env` and migrated schema. The current health check does **not** require DB connectivity.



---



## Tests Not Covered (honest gaps)



1. **Status machine integration tests** — file exists, tests are todos

2. **Auth endpoints** — no test file

3. **Admin/representative management** — no test file

4. **Ticket CRUD with RBAC** — no test file

5. **Frontend** — no automated tests

6. **Regression suite for dashboard/settings** — none



<!-- Add your own testing priorities and manual test checklists here. -->


