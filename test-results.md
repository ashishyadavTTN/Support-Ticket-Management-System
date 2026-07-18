# Test Results

## Summary

**Last run:** 2026-07-18  
**Command:** `npm test` (from `ai-practical-assessment/`)  
**Environment:** Windows, Node 22.22.0, MSSQL with seeded data  
**Outcome:** ✅ **PASS** — 45 tests passed, 0 failures

```
Test Suites: 7 passed, 7 total
Tests:       45 passed, 45 total
Time:        ~32 s
```

## Test suites

| Suite | File | Tests | Status |
|-------|------|-------|--------|
| Health | `tests/health.integration.js` | 1 | ✅ Pass |
| Auth | `tests/auth.integration.js` | 11 | ✅ Pass |
| Ticket status transitions | `tests/ticket-status-transitions.integration.js` | 5 | ✅ Pass |
| Ticket CRUD | `tests/ticket-crud.integration.js` | 8 | ✅ Pass |
| Ticket RBAC | `tests/ticket-rbac.integration.js` | 9 | ✅ Pass |
| Admin | `tests/admin.integration.js` | 6 | ✅ Pass |
| Dashboard | `tests/dashboard.integration.js` | 3 | ✅ Pass |

## Coverage highlights

- **Auth:** login, register, refresh cookie flow, logout, profile update, password validation
- **Tickets:** CRUD, search, comments, status state machine, `resolvedAt` side effects
- **RBAC:** customer isolation, rep scoping, privileged permissions, admin route protection
- **Admin:** representative management, deactivation blocks login
- **Dashboard:** admin org stats, customer/rep role-scoped stats

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
