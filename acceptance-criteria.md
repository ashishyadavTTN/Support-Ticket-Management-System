# Acceptance Criteria

> **Note:** Checkboxes marked `[x]` reflect what is **implemented in code today**. Unchecked items are either not started or intentionally deferred.

## Core (original exercise)

- [x] Users can create tickets (customer self-service and admin/rep on behalf of customer)
- [x] Users can list tickets (role-scoped on the server)
- [x] Users can view a single ticket with comments
- [x] Representatives/admins can update ticket fields (title, description, priority) and reassign via UI + API
- [x] Representatives/admins can change ticket status via state machine (`PATCH /tickets/:id/status`)
- [x] Users with `canComment` can add comments on accessible tickets
- [x] Invalid status transitions are rejected with `400`
- [x] Keyword search and status filter work in admin/rep list **and** customer portal
- [x] Sequelize models and migrations for User, Ticket, Comment, Attachment
- [x] Demo seed data for development/testing
- [x] State-machine integration tests (valid + invalid paths)

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
- [x] Unit tests for the status state machine and `formatTicketId`
- [x] Health check integration test passes
- [x] Status-transition integration tests (valid paths, invalid paths, terminal states, `resolved → open`, customer 403)
- [x] Auth, RBAC, CRUD, attachments, admin, dashboard, and assignment integration suites
- [x] Frontend automated tests (Vitest + React Testing Library — login, filters, validation helpers)

## Documentation

- [x] `api-contract.md` documents implemented HTTP endpoints (including attachments)
- [x] `data-model.md` reflects current schema (UUID tickets + Attachments)
- [x] `ui-flow.md` describes current navigation
- [x] `tool-workflow.md`, `debugging-notes.md`, `test-results.md` completed
- [x] `candidate-info.md`, `reflection.md`, `pr-description.md`, and review docs completed

---

## Scope additions (beyond original Core)

### Authentication & RBAC

- [x] JWT login with refresh cookie rotation
- [x] Role-based route protection on frontend and backend
- [x] Granular representative permissions (`canViewAllTickets`, `canAssignTickets`, etc.)
- [x] Admin can create/deactivate representatives and edit permissions
- [x] Customer data isolation enforced in SQL (`buildTicketListFilter`)

### UI / UX (role-specific)

- [x] Admin/rep ticket table with filters, pagination, slide panel (editable fields + reassign)
- [x] Customer portal with status cards, keyword search, status filter, ticket grid, detail stepper
- [x] Representatives management page (admin)
- [x] Dashboard stats (admin, rep, customer)
- [x] Settings page (profile, password, theme)
- [x] Image attachments on ticket create and comments
- [x] Global loading bar, debounced search, dark mode, breadcrumbs

### Dashboard / analytics

- [x] `resolvedAt` timestamp set on transition to `resolved`
- [x] Admin / rep / customer dashboard metrics

## Overall Judgment

Mandatory Core criteria are implemented in code (create/list/detail/update fields + reassign, comments, enforced state machine, keyword search + status filter on admin/rep **and** customer UIs, MSSQL persistence, backend validation, no secrets committed, state-machine integration tests). Stretch additions include auth/RBAC, attachments, UUID ticket IDs, dashboards, and frontend component/unit tests via Vitest.
