# Acceptance Criteria

> **Note:** Checkboxes marked `[x]` reflect what is **implemented in code today**. Unchecked items are either not started, placeholder assessment sections, or still need your judgment. Scope additions beyond the original Core are listed separately.

## Core (original exercise)

- [x] Users can create tickets (customer self-service and admin on behalf of customer)
- [x] Users can list tickets (role-scoped on the server)
- [x] Users can view a single ticket with comments
- [x] Representatives/admins can update ticket fields (title, description, priority, assignee)
- [x] Representatives/admins can change ticket status via state machine (`PATCH /tickets/:id/status`)
- [x] Users with `canComment` can add comments on accessible tickets
- [x] Invalid status transitions are rejected with `400`
- [x] Sequelize models and migrations for User, Ticket, Comment
- [x] Demo seed data for development/testing

## Validation

- [x] Server-side validation via `express-validator` on routes
- [x] Model-level FK integrity hooks on Ticket (`createdBy` → customer, `assignedTo` → rep)
- [x] Client-side form validation on login, register, settings, and ticket forms
- [x] Email/password rules enforced on auth and settings endpoints

## Error Handling

- [x] Centralized `errorHandler` middleware with consistent JSON error shape
- [x] `401` / `403` / `404` / `409` responses for auth, access, and conflict cases
- [x] Frontend toast notifications for user-facing errors
- [x] Session expiry handling with refresh retry and redirect to login

## Testing

- [x] Jest + Supertest test harness configured
- [x] Unit tests for the status state machine (`tests/unit/statusTransitions.test.js`, DB-free)
- [x] Health check integration test passes
- [x] Status-transition integration tests (valid paths, invalid paths, terminal states, `resolved → open`, customer 403)
- [x] Auth endpoint integration tests (`tests/auth.integration.js`)
- [x] RBAC / permission integration tests (`tests/ticket-rbac.integration.js`)
- [x] Ticket CRUD, search, and status filter integration tests
- [x] Admin and dashboard integration tests
- [ ] Frontend automated tests (none configured — manual UI testing only)

## Documentation

- [x] `api-contract.md` documents implemented HTTP endpoints
- [x] `data-model.md` reflects current schema
- [x] `ui-flow.md` describes current navigation
- [x] `tool-workflow.md`, `debugging-notes.md`, `test-results.md` completed
- [x] `candidate-info.md`, `reflection.md`, `pr-description.md`, and review docs completed

---

## Scope additions (beyond original Core)

These acceptance criteria emerged as the project grew; they were **not** in the original scaffold:

### Authentication & RBAC

- [x] JWT login with refresh cookie rotation
- [x] Role-based route protection on frontend and backend
- [x] Granular representative permissions (`canViewAllTickets`, `canAssignTickets`, etc.)
- [x] Admin can create/deactivate representatives and edit permissions
- [x] Customer data isolation enforced in SQL (`buildTicketListFilter`)

### UI / UX (role-specific)

- [x] Admin/rep ticket table with filters, pagination, slide panel
- [x] Customer portal with status cards, ticket grid, detail stepper
- [x] Representatives management page (admin)
- [x] Dashboard stats (admin, rep, customer)
- [x] Settings page (profile, password, theme)
- [x] Global loading bar, debounced search, dark mode, breadcrumbs

### Dashboard / analytics

- [x] `resolvedAt` timestamp set on transition to `resolved`
- [x] Admin dashboard: open tickets, active users by role, avg resolution (30d)
- [x] Rep dashboard: assigned open count, avg resolution (30d, scoped)
- [x] Customer dashboard: ticket counts by status (scoped)

## Overall Judgment

All mandatory Core criteria pass in code today (create/list/detail/update, comments, enforced state machine with invalid transitions rejected, keyword search + status filter, MSSQL persistence, backend validation, no secrets committed, state-machine integration tests). The only unchecked item is **frontend automated tests**, which are intentionally out of scope for this exercise (backend integration tests cover the API contracts). Customer-facing search/filter UI is deferred with rationale (admin/rep list demonstrates the feature; the API supports both).
