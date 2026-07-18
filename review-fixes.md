# Review Fixes

## Fix Summary

Addressed security, UX, RBAC correctness, test coverage, and documentation consistency issues found during self-review and the pre-submission audit.

## Items Addressed

| Review finding | Fix |
|----------------|-----|
| UI-only ticket filtering | Added `buildTicketListFilter()` to Sequelize `where` in `getTickets` |
| Password hash exposure risk | `User` default scope excludes `passwordHash`; login uses `withPassword` scope |
| SPA refresh 401 JSON | `spaHtmlBypass` in `vite.config.js` for `/tickets`, `/admin`, `/dashboard` proxies |
| Permissions JSON as string from MSSQL | `getEffectivePermissions()` parses string before merge |
| Status bypass via PUT | `updateTicket` returns 400 if `status` sent in body |
| Modal focus loss | Fixed re-mount behavior in `Modal.jsx` and `SlidePanel.jsx` |
| Stale test documentation | Updated `acceptance-criteria.md`, `test-strategy.md`, `test-results.md`, `project-context.md`, `spec.md` |
| Incomplete state machine tests | Added `open→cancelled`, `in_progress→cancelled`, terminal rejection, `?status=open` filter test |
| Empty workflow artifacts | Completed `tool-workflow.md`, `reflection.md`, `pr-description.md`, `database/setup-notes.md` |

## Items Deferred

| Finding | Rationale |
|---------|-----------|
| Frontend automated tests | Time vs value for exercise deadline; backend integration tests cover API contracts |
| Customer portal search/filter UI | API supports filters; admin/rep UI demonstrates Core requirement; customer sees status summary cards |
| Unit tests for pure helpers | Covered indirectly by integration tests |
| Docker / CI pipeline | Out of exercise scope |
| Admin default permission template editing | View-only template sufficient for demo |
