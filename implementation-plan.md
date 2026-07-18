# Implementation Plan

> **Note:** The sections below with placeholders are for your original plan. A factual **Actual vs Planned** summary is at the end based on what was built.

## Overview

Build the system in **layers, from the data outward**, so each layer is verifiable before the next depends on it: data model → authentication → ticket API (with the status state machine) → role-specific UIs. Core (CRUD, comments, state machine, search/filter, validation, persistence, integration tests) is completed first; stretch (auth, RBAC, dashboards, analytics) is layered on top only once Core is green. AI (Cursor) is used to accelerate scaffolding and boilerplate, with human review reserved for security boundaries and scope control.

## Task Breakdown

1. **Data layer** — Sequelize models (User, Ticket, Comment) + associations; migrations; seed data.
2. **Status state machine** — `constants/statusTransitions.js`; enforce in `updateTicketStatus`; block `status` on generic `PUT`.
3. **Ticket API** — create/list/detail/update, comments, keyword search + status filter, pagination/sort.
4. **Validation & errors** — `express-validator` on routes, `beforeValidate` FK/role hooks, centralized `errorHandler`.
5. **Auth (stretch)** — bcrypt, JWT access + httpOnly refresh cookie, `authenticate`/`authorize`/`checkPermission`.
6. **RBAC (stretch)** — roles, `permissions` JSON, `isActive`, SQL-level ticket scoping (`buildTicketListFilter`).
7. **Frontend** — design system, auth context/route guards, admin/rep ticket table, customer portal, dashboards, settings.
8. **Tests** — Jest + Supertest integration suites; state-machine coverage first, then auth/RBAC/CRUD/admin/dashboard.
9. **Docs & review** — keep `api-contract.md`/`data-model.md` in sync; self-review pass; final doc audit against `npm test`.

## Milestones

| Milestone | Definition of done |
|-----------|--------------------|
| M1 — Data layer | Migrations + seed run cleanly; models associated |
| M2 — Core ticket API | CRUD, comments, state machine, search/filter, validation passing manually |
| M3 — Core tests green | State-machine integration tests (valid + invalid) pass |
| M4 — Auth + RBAC | Protected routes, server-enforced scoping, RBAC tests pass |
| M5 — Frontend flows | All three roles usable end to end |
| M6 — Submission | Full suite green; docs synced; no secrets committed |

## AI Usage Plan

- **Scaffolding/boilerplate:** models, migrations, React components, middleware (accept with a diff review).
- **Design comparison:** options such as permissions JSON vs. join table, `resolvedAt` column vs. status-history table.
- **Test authoring:** generate Supertest suites from the API contract, then correct assertions against real error output.
- **Debugging:** ask for root cause before applying fixes; record each in `debugging-notes.md`.
- **Not delegated to AI:** final call on security boundaries, scope (Core before stretch), and what data is shared (placeholders only).

## Risks

- MSSQL-specific behavior (e.g. JSON columns returned as strings) breaking RBAC logic.
- Sequelize CLI package resolution when migrations run from the repo root.
- SPA/dev-proxy path overlap (`/tickets`, `/admin`) returning API JSON on browser refresh.
- Scope creep from stretch features crowding out Core completion and test coverage.
- Single-developer time budget limiting frontend automated testing.

## Mitigation

- Parse/normalize permissions in `getEffectivePermissions()`; cover with RBAC integration tests.
- Add `sequelize`/`tedious` to root deps and a `.sequelizerc` so CLI resolves from repo root.
- Add `spaHtmlBypass` to the Vite proxy for HTML navigations.
- Gate stretch work behind "Core tests green" (M3); track status in `tool-specific/cursor-workflow/tasks.md`.
- Prioritize backend integration tests (best ROI); document the frontend-test gap honestly rather than fake it.

---

## Actual vs Planned

This section records how the build **diverged** from the original Core scaffold without replacing your original plan above.

### Original Core scaffold (planned / stubbed)

| Planned item | Original state |
|--------------|----------------|
| Ticket CRUD API | Routes/controllers present; status machine and validation were TODOs |
| Comments | Basic create/list endpoints |
| React UI | List, detail, new ticket pages with plain CSS |
| Auth | Not in scope — `passwordHash` column reserved |
| RBAC | Role enum only; no permission enforcement |
| Tests | Placeholder integration test file |

### What was actually built (additions & completions)

| Phase | Delivered |
|-------|-----------|
| **Data layer** | RBAC migration (`passwordHash`, `isActive`, `permissions`); `resolvedAt` on tickets |
| **Auth** | Full JWT flow; `authenticate` / `authorize` / `checkPermission` middleware; protected routes |
| **Ticket API** | Pagination, search, multi-filter, sort; state machine; role-scoped list/detail access |
| **Admin API** | Representatives CRUD-ish (create, list, patch permissions/active); customers list; dashboard stats |
| **Settings API** | Profile, email, password update endpoints |
| **Frontend foundation** | Tailwind design system; shared UI components; AuthContext; route guards; app shell |
| **Role UIs** | Admin/rep ticket table; customer portal; rep management; dashboards; settings |
| **UX polish** | Loading bar, debounced search, dark mode, breadcrumbs |
| **Docs** | `api-contract.md`, `data-model.md`, `ui-flow.md`, `design-notes.md` updated incrementally |

### Still incomplete vs a production system

- No frontend test runner (manual UI validation only)
- No unit tests for isolated pure functions
- Admin default permission template is view-only (editing deferred)
- Admin dashboard has no "trend" metrics (e.g. +N since yesterday)
- No Docker/CI pipeline or OpenAPI/Swagger spec

## Retrospective

- **Biggest divergence from plan:** the project grew well beyond the original Core scaffold into a full auth/RBAC application. Core was completed first, which kept the state machine and tests stable while stretch features were added.
- **Main blocker:** MSSQL returning `permissions` JSON as a string silently broke RBAC flags until `getEffectivePermissions()` was hardened (see `test-results.md`).
- **What I'd change:** commit per milestone instead of one large commit, and fill lifecycle docs (this plan, `tool-workflow.md`) as I went rather than in a final audit pass.
