# Test Results

## Summary

**Last run:** 2026-07-18  
**Command:** `npm test` (from `ai-practical-assessment/`)  
**Environment:** Windows, Node 22.22.0, MSSQL with seeded data  
**Outcome:** ✅ **PASS** — 56 tests passed, 0 failures

```
Test Suites: 8 passed, 8 total
Tests:       56 passed, 56 total
```

> **Since this run:** a `resolved → open` rejection case was added to the status-transition suite, and a new database-free unit suite (`tests/unit/statusTransitions.test.js`) was added. Re-run `npm test` to record the updated totals (expected: 9 suites, one additional integration test plus the unit cases).

## Test suites

| Suite | File | Tests | Status |
|-------|------|-------|--------|
| Health | `tests/health.integration.js` | 1 | ✅ Pass |
| Auth | `tests/auth.integration.js` | 12 | ✅ Pass |
| Ticket status transitions | `tests/ticket-status-transitions.integration.js` | 8 | ✅ Pass |
| Ticket CRUD | `tests/ticket-crud.integration.js` | 10 | ✅ Pass |
| Ticket RBAC | `tests/ticket-rbac.integration.js` | 9 | ✅ Pass |
| Ticket assignment | `tests/ticket-assignment.integration.js` | 6 | ✅ Pass |
| Admin | `tests/admin.integration.js` | 7 | ✅ Pass |
| Dashboard | `tests/dashboard.integration.js` | 3 | ✅ Pass |

## Coverage highlights

- **Auth:** login, register, refresh cookie flow, logout, profile update, password validation
- **Tickets:** CRUD, keyword search, status filter, comments, full state machine, `resolvedAt` side effects
- **RBAC:** customer isolation, rep scoping, privileged permissions, admin route protection
- **Admin:** representative management, deactivation blocks login
- **Dashboard:** admin org stats, customer/rep role-scoped stats
- **Assignment:** auto-assign to lowest-queue rep, rep `canCreateTickets`, customer list gating

## State machine tests added (final audit)

- `open → cancelled` and `in_progress → cancelled` (valid Core paths)
- `resolved → open` (non-terminal invalid transition rejected)
- `closed → open` and `cancelled → open` (terminal rejection)
- `GET /tickets?status=open` (status filter)
- Pure unit coverage of the state machine in `tests/unit/statusTransitions.test.js`

## Bug fixed during testing

**Representative permissions from MSSQL:** Seeded `permissions` JSON was sometimes returned as a string from the database. `User.getEffectivePermissions()` now parses string values before merging role defaults, so permission flags like `canViewAllTickets` work correctly.

## Not covered (automated)

- Frontend component / E2E browser tests
- Manual UI regression across all roles
- Concurrent load / performance testing

## Re-run

```bash
npm run db:migrate
npm run db:seed
npm test
```
