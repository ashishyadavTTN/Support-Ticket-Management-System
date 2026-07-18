# Requirements Analysis

## Selected Project Option

Support Ticket Management System

## My Understanding

Build a full-stack ticket platform where customers submit and track requests, representatives triage and resolve them, and admins oversee users and workload. Core requirements: CRUD, comments, enforced status state machine, keyword search + status filter, persistence, backend validation, integration tests for the state machine, and documented AI-assisted workflow.

Stretch areas (auth, RBAC, richer UI) were added after Core was complete.

## Functional Requirements

### Original Core scope (as scaffolded)

The initial exercise scaffold targeted:

- Ticket CRUD (create, list, detail, update fields)
- Comments on tickets
- Status field on tickets (business rules initially stubbed as TODOs)
- Basic React UI (list, detail, create pages)
- Sequelize models for User, Ticket, Comment
- MSSQL database with migrations and seed data

### Implemented beyond original Core (factual — added during exercise)

These were **not** in the original stub/TODO-only Core but are now built:

| Area | What was added |
|------|----------------|
| **Authentication** | JWT access + httpOnly refresh cookies; register/login/logout/refresh; profile/email/password settings |
| **RBAC** | Roles (`admin`, `representative`, `customer`); `permissions` JSON on users; `isActive`; middleware (`authenticate`, `authorize`, `checkPermission`) |
| **Admin APIs** | Representative management, customer list, dashboard stats, default permission template |
| **Ticket list (internal)** | Paginated/filtered/sorted list; URL-synced filters; slide-panel detail; state machine for status transitions |
| **Customer portal** | Role-specific dashboard, status stepper, conversation UI, create modal/FAB |
| **Representative management UI** | Admin table, permission editor, active toggle |
| **Dashboard stats** | Admin/rep/customer metrics; `resolvedAt` column for resolution time |
| **Settings page** | Profile, email, password, theme preference, admin permission template (view-only) |
| **UX polish** | Global loading bar, debounced search, dark mode, breadcrumbs |

## Non-Functional Requirements

- **Security:** Server-enforced access control; no password hashes in API responses; JWT + httpOnly refresh cookies
- **Maintainability:** Centralized error handler, shared API client, documented API contract
- **Usability:** Role-specific UIs, loading/error states, dark mode
- **Testability:** Integration tests against real MSSQL with seeded personas

## Assumptions

- Single-tenant deployment (no multi-org isolation)
- MSSQL available locally or via Azure SQL
- Demo password `Password123!` acceptable for seed data
- Customer portal does not need search/filter UI if admin/rep list demonstrates the API feature

## Clarifications

- Status changes must use dedicated endpoint, not generic PUT
- Representatives need configurable visibility (`canViewAllTickets`) to test assigned-only vs all-tickets views
- `resolvedAt` column is sufficient for resolution analytics without a full audit history table

## Edge Cases

- Deactivated user with valid JWT → rejected on next request after DB reload
- Customer attempting another customer's ticket → 403
- Invalid status transition (e.g. `open → closed`, reopen from `closed`) → 400
- MSSQL returning JSON columns as strings → permissions must be parsed before use
- Browser refresh on SPA routes overlapping API proxy paths → serve `index.html` for HTML requests
