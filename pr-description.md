# Pull Request Description

## Summary

Implements a full-stack Support Ticket Management System with JWT authentication, RBAC, ticket CRUD with enforced status state machine, comments, search/filter/pagination, image attachments, role-specific React UIs, and 85 backend tests (11 suites).

## Features

### Core ticket management
- Create, list, view, and update tickets (title/description/priority) with reassignment and comments
- Status changes via `PATCH /tickets/:id/status` with state machine validation
- Keyword search and status filter on admin/rep list **and** customer portal
- Server-side validation and consistent error responses

### Authentication & RBAC
- JWT access tokens (memory) + httpOnly refresh cookies
- Roles: admin, representative, customer
- Granular representative permissions (`canViewAllTickets`, `canAssignTickets`, etc.)
- Server-enforced ticket scoping in SQL (`buildTicketListFilter`, `assertTicketAccess`)

### Role-specific UIs
- **Admin:** dashboard stats, full ticket table with filters, representative management, settings
- **Representative:** scoped ticket list and dashboard
- **Customer:** portal with status cards, keyword search, status filter, ticket grid, detail stepper, create modal

### Stretch
- Image attachments on ticket create and comments (JWT-gated download)
- UUID ticket IDs with short display formatting
- Dashboard analytics with `resolvedAt` for average resolution time
- Auto-assignment of new customer tickets to rep with lowest open/in-progress queue

### UX polish
- Tailwind design system with dark mode
- Global loading bar, debounced search, breadcrumbs, toasts, `ErrorState` components
- Session expiry handling with silent refresh and redirect

## Technical Changes

- Sequelize migrations for Users, Tickets, Comments, RBAC columns, `resolvedAt`, Attachments, UUID conversion
- Express middleware chain: `authenticate` → `authorize` / `checkPermission`
- Central frontend API client with 401 refresh deduplication
- Vite `spaHtmlBypass` for dev-server proxy overlap with SPA routes

## Testing

```bash
npm run db:migrate
npm run db:seed
npm test
```

11 suites, 85 tests — see `test-results.md`.

State machine tests cover:
- Valid paths: `open → in_progress → resolved → closed`, `open → cancelled`, `in_progress → cancelled`
- Invalid paths: `open → closed`, `resolved → open`, terminal → reopen
- Customer 403, 404, `resolvedAt` side effects

## Breaking Changes

Requires running migrations:

```bash
npm run db:migrate
npm run db:seed
```

Existing databases need RBAC, `resolvedAt`, attachments, and UUID migrations.

## Checklist

- [x] Core ticket CRUD, field updates, reassign, and comments
- [x] Status state machine enforced on backend
- [x] Keyword search + status filter (admin/rep + customer)
- [x] Integration + unit tests pass (`npm test`)
- [x] Frontend Vitest suite passes (`npm run test:frontend`)
- [x] README and setup docs updated
- [x] No secrets committed (`.env` gitignored)
- [x] `api-contract.md` and `data-model.md` match implementation
