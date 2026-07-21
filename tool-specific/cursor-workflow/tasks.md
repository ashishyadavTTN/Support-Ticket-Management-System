# Tasks

## Completed

- [x] Scaffold project structure (frontend, backend, migrations, seed data)
- [x] Auth — JWT access + httpOnly refresh, login, register, logout, profile settings
- [x] RBAC — roles, representative permissions, `isActive`, server-enforced ticket access
- [x] Ticket CRUD — create, list (search/filter/sort/paginate), detail, update fields, reassign
- [x] Status state machine — `PATCH /tickets/:id/status` with `resolvedAt` side effects
- [x] Comments — add and list per ticket
- [x] Image attachments — ticket create + comments; JWT-gated download
- [x] UUID ticket IDs + short display formatting
- [x] Admin APIs — representatives, customers, dashboard stats, default permissions
- [x] Frontend design system — Tailwind theme, dark mode, shared UI primitives
- [x] Admin/rep ticket list — filters, debounced search, slide panel with field edits
- [x] Customer portal — status cards, keyword search, status filter, ticket grid, FAB create
- [x] Representatives management UI — add, edit panel, permissions, active toggle
- [x] Dashboards — admin, rep, and customer stats
- [x] Settings pages — profile, email, password, theme (all roles)
- [x] UX polish — loading bar, breadcrumbs, toasts, skeleton states
- [x] Bug fix — Modal/SlidePanel focus loss on keystroke (`Modal.jsx`, `SlidePanel.jsx`)
- [x] Bug fix — Representative permissions JSON string parsing (`User.js`)
- [x] **Backend tests** — 85 tests across 11 suites (`tests/` + `tests/unit/`)
- [x] **Frontend tests** — Vitest + Testing Library (25 tests: login, filters, validation, status helpers)
- [x] Doc sync — attachments, UUID, test counts, customer search/filter, field-edit UI

## In Progress

- [ ] _(none)_

## Backlog

- [ ] Broader frontend coverage / browser E2E (Playwright/Cypress)
