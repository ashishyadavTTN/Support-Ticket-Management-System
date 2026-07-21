# Test Results

## Summary

**Last run:** 2026-07-21  
**Command:** `npm test` (from `ai-practical-assessment/`)  
**Environment:** Windows, Node 22, MSSQL with seeded data  
**Outcome:** ✅ **PASS** — 85 tests passed, 0 failures

```
Test Suites: 11 passed, 11 total
Tests:       85 passed, 85 total
```

## Test suites

| Suite | File | Status |
|-------|------|--------|
| Health | `tests/health.integration.js` | ✅ Pass |
| Auth | `tests/auth.integration.js` | ✅ Pass |
| Ticket status transitions | `tests/ticket-status-transitions.integration.js` | ✅ Pass |
| Ticket CRUD | `tests/ticket-crud.integration.js` | ✅ Pass |
| Ticket RBAC | `tests/ticket-rbac.integration.js` | ✅ Pass |
| Ticket assignment | `tests/ticket-assignment.integration.js` | ✅ Pass |
| Ticket attachments | `tests/ticket-attachments.integration.js` | ✅ Pass |
| Admin | `tests/admin.integration.js` | ✅ Pass |
| Dashboard | `tests/dashboard.integration.js` | ✅ Pass |
| Status transitions (unit) | `tests/unit/statusTransitions.test.js` | ✅ Pass |
| Format ticket ID (unit) | `tests/unit/formatTicketId.test.js` | ✅ Pass |

## Coverage highlights

- **Auth:** login, register, refresh cookie flow, logout, profile update, password validation
- **Tickets:** CRUD, field updates, keyword search, status filter, comments, full state machine, `resolvedAt` side effects
- **Attachments:** image upload on create/comment, fetch by id, validation limits
- **RBAC:** customer isolation, rep scoping, privileged permissions, admin route protection
- **Admin:** representative management, deactivation blocks login
- **Dashboard:** admin org stats, customer/rep role-scoped stats
- **Assignment:** auto-assign to lowest-queue rep, rep `canCreateTickets`, customer list gating
- **Unit:** pure state-machine rules; `formatTicketId` display helper

## State machine coverage

- Valid: `open → in_progress → resolved → closed`, `open → cancelled`, `in_progress → cancelled`
- Invalid: `open → closed`, `resolved → open`, terminal reopen (`closed`/`cancelled`)
- Customer 403, missing ticket 404, `resolvedAt` set/cleared

## Bug fixed during testing

**Representative permissions from MSSQL:** Seeded `permissions` JSON was sometimes returned as a string. `User.getEffectivePermissions()` parses string values before merging role defaults.

## Not covered (automated)

- Browser E2E (Playwright/Cypress)
- Concurrent load / performance testing

## Frontend tests

```bash
npm run test:frontend
```

**Last run:** 2026-07-21 — ✅ **25 passed** across 7 Vitest files (login, filter bar, status dropdown, ErrorState, validation, formatTicketId, status helpers). No database required.

## Re-run

```bash
npm run db:migrate
npm run db:seed
npm test
```
