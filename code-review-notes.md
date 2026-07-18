# Code Review Notes

## Reviewer

Self-review with Cursor AI assistance before submission.

## Findings

### Critical

None remaining at submission.

### Major

| # | Finding | Location | Severity |
|---|---------|----------|----------|
| 1 | Ticket list filtering must happen in SQL, not UI-only | `ticketController.getTickets` | Major (fixed) |
| 2 | `passwordHash` must never appear in API responses | `User` default scope | Major (fixed) |
| 3 | Browser refresh on `/tickets` returned API 401 JSON instead of SPA | `vite.config.js` proxy | Major (fixed) |
| 4 | MSSQL returns `permissions` JSON as string — RBAC flags silently fail | `User.getEffectivePermissions()` | Major (fixed) |

### Minor

| # | Finding | Location | Severity |
|---|---------|----------|----------|
| 5 | Status updates allowed via `PUT /tickets/:id` would bypass state machine | `updateTicket` rejects `status` in body | Minor (fixed) |
| 6 | Documentation drift — test docs claimed `it.todo` while tests were implemented | `acceptance-criteria.md`, `test-strategy.md` | Minor (fixed at submission) |
| 7 | Customer portal lacks search/filter UI (API supports it) | `CustomerPortal.jsx` | Minor (accepted — admin/rep list demonstrates feature) |
| 8 | Modal/SlidePanel lost focus on keystroke | `Modal.jsx`, `SlidePanel.jsx` | Minor (fixed) |

## Severity Summary

- **Critical:** 0 open
- **Major:** 4 found, 4 fixed
- **Minor:** 4 found, 3 fixed, 1 accepted with rationale

## Action Items

- [x] Enforce ticket scoping in Sequelize `where` clause
- [x] Add `spaHtmlBypass` to Vite proxy config
- [x] Parse string permissions in `getEffectivePermissions()`
- [x] Reject `status` field on `PUT /tickets/:id`
- [x] Sync lifecycle docs with actual test count and coverage
- [x] Add missing state machine test cases (`cancelled`, terminal states, status filter)
- [ ] Add frontend test runner (deferred)

## Observations

The strongest areas are backend security boundaries and integration test coverage. The weakest area is lifecycle doc maintenance — several markdown files lagged behind the code until the final audit pass.
