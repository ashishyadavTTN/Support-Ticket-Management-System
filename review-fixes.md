# Review Fixes

## Fix Summary

Addressed security, UX, RBAC correctness, Core UI gaps, test coverage, and documentation consistency issues found during self-review and pre-submission audits.

## Items Addressed

| Review finding | Fix |
|----------------|-----|
| UI-only ticket filtering | Added `buildTicketListFilter()` to Sequelize `where` in `getTickets` |
| Password hash exposure risk | `User` default scope excludes `passwordHash`; login uses `withPassword` scope |
| SPA refresh 401 JSON | `spaHtmlBypass` in `vite.config.js` for `/tickets`, `/admin`, `/dashboard` proxies |
| Permissions JSON as string from MSSQL | `getEffectivePermissions()` parses string before merge |
| Status bypass via PUT | `updateTicket` returns 400 if `status` sent in body |
| Modal focus loss | Fixed re-mount behavior in `Modal.jsx` and `SlidePanel.jsx` |
| Incomplete state machine tests | Added cancel paths, terminal rejection, `resolved→open`, status filter test |
| Ticket field updates only via API | Admin/rep slide panel now edits title, description, priority (+ reassign) |
| Customer portal missing keyword search | Debounced search + status filter (incl. cancelled) on `CustomerPortal` |
| Stale docs (attachments/UUID/test counts) | Synced `api-contract.md`, `data-model.md`, `spec.md`, `test-results.md`, etc. |

## Items Deferred

| Finding | Rationale |
|---------|-----------|
| Browser E2E suite | Vitest component tests cover highest-ROI UI paths; full E2E deferred |
| Docker / CI pipeline | Out of exercise scope |
| Admin default permission template editing | View-only template sufficient for demo |
| OpenAPI/Swagger | `api-contract.md` is the documented contract for this exercise |
