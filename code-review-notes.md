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
| 5 | Lifecycle docs claimed attachments / UUID work were out of scope while shipped | `data-model.md`, `api-contract.md`, `spec.md` | Major (fixed) |

### Minor

| # | Finding | Location | Severity |
|---|---------|----------|----------|
| 6 | Status updates allowed via `PUT /tickets/:id` would bypass state machine | `updateTicket` rejects `status` in body | Minor (fixed) |
| 7 | Documentation drift — stale test counts (56 vs 85) | `test-results.md`, PR, candidate-info | Minor (fixed) |
| 8 | Admin/rep UI could reassign but not edit title/description/priority | `TicketDetailPanel.jsx` | Minor (fixed) |
| 9 | Customer portal lacked keyword search | `CustomerPortal.jsx` | Minor (fixed) |
| 10 | Modal/SlidePanel lost focus on keystroke | `Modal.jsx`, `SlidePanel.jsx` | Minor (fixed) |

## Severity Summary

- **Critical:** 0 open
- **Major:** 5 found, 5 fixed
- **Minor:** 5 found, 5 fixed

## Action Items

- [x] Enforce ticket scoping in Sequelize `where` clause
- [x] Add `spaHtmlBypass` to Vite proxy config
- [x] Parse string permissions in `getEffectivePermissions()`
- [x] Reject `status` field on `PUT /tickets/:id`
- [x] Sync lifecycle docs with attachments, UUID tickets, and current `npm test` totals
- [x] Add field-edit UI + customer keyword search for Core completeness
- [x] Add frontend Vitest suite (login, filters, validation helpers)
- [ ] Expand frontend coverage / add E2E (optional)

## Observations

The strongest areas are backend security boundaries and integration test coverage. The weakest recurring issue was lifecycle doc lag behind stretch features — addressed in the final audit pass.
