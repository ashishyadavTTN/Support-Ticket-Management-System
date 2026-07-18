# Acceptance Criteria

## Core

- [x] Ticket CRUD API endpoints respond correctly
- [x] Comments can be added and listed per ticket
- [x] Users can create and view tickets via UI (role-specific flows)

## Validation

- [x] Status transitions follow state machine rules (backend enforced)
- [x] Invalid transitions return `400`
- [x] Server-side validation via `express-validator` and model hooks

## Error Handling

- [x] Consistent JSON error responses from API (`errorHandler`, `HttpError`)
- [x] Frontend toasts and `ErrorState` for user-facing failures

## Testing

- [x] Integration tests pass for status transitions (valid, invalid, terminal, customer 403)
- [x] Auth, RBAC, CRUD, admin, dashboard, and assignment suites pass (`npm test`)
- [ ] Frontend automated tests (manual UI validation only)

## Documentation

- [x] API contract and data model kept up to date
- [x] `tool-workflow.md`, `debugging-notes.md`, `test-results.md` reflect current state
