# Tasks

## Completed

- [x] Scaffold project structure (frontend, backend, migrations, seed data)
- [x] Auth — JWT access + httpOnly refresh, login, register, logout, profile settings
- [x] RBAC — roles, representative permissions, `isActive`, server-enforced ticket access
- [x] Ticket CRUD — create, list (search/filter/sort/paginate), detail, update
- [x] Status state machine — `PATCH /tickets/:id/status` with `resolvedAt` side effects
- [x] Comments — add and list per ticket
- [x] Admin APIs — representatives, customers, dashboard stats, default permissions
- [x] Frontend design system — Tailwind theme, dark mode, shared UI primitives
- [x] Admin/rep ticket list — filters, debounced search, slide panel detail
- [x] Customer portal — status cards, ticket grid, FAB, "Get help" create modal
- [x] Representatives management UI — add, edit panel, permissions, active toggle
- [x] Dashboards — admin, rep, and customer stats
- [x] Settings pages — profile, email, password, theme (all roles)
- [x] UX polish — loading bar, breadcrumbs, toasts, skeleton states
- [x] Bug fix — Modal/SlidePanel focus loss on keystroke (`Modal.jsx`, `SlidePanel.jsx`)
- [x] Bug fix — Representative permissions JSON string parsing (`User.js`)
- [x] **Backend integration tests** — 56 tests across 8 suites (`tests/`)

## In Progress

- [ ] _(none)_

## Backlog

- [ ] Frontend automated tests (no test runner configured)
- [ ] Browser E2E tests (Playwright/Cypress)
