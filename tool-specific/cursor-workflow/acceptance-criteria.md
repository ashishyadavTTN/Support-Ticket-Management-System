# Acceptance Criteria

## Core

- [x] Ticket CRUD API endpoints respond correctly (including field updates)
- [x] Comments can be added and listed per ticket
- [x] Users can create and view tickets via UI (role-specific flows)
- [x] Admin/rep can update title, description, priority, and assignee in the UI
- [x] Keyword search + status filter on admin/rep list and customer portal

## Validation

- [x] Status transitions follow state machine rules (backend enforced)
- [x] Invalid transitions return `400`
- [x] Server-side validation via `express-validator` and model hooks

## Error Handling

- [x] Consistent JSON error responses from API (`errorHandler`, `HttpError`)
- [x] Frontend toasts and `ErrorState` for user-facing failures

## Testing

- [x] Integration tests pass for status transitions (valid, invalid, terminal, customer 403)
- [x] Auth, RBAC, CRUD, attachments, admin, dashboard, assignment, and unit suites pass (`npm test` — 85 tests)
- [x] Frontend automated tests (`npm run test:frontend` — Vitest, 25 tests)

## Documentation

- [x] API contract and data model kept up to date (attachments + UUID tickets)
- [x] `tool-workflow.md`, `debugging-notes.md`, `test-results.md` reflect current state
