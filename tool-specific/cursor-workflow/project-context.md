# Project Context

Persistent context for AI-assisted sessions on this repository.

## Purpose

Support Ticket Management System — AI capability exercise. Full-stack app with role-based access (admin, representative, customer), JWT authentication, and role-specific React UIs.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 6, React Router 6, Tailwind CSS 3 |
| Backend | Node.js, Express 4, Sequelize 6 |
| Database | **Microsoft SQL Server** (`tedious` driver) |
| Auth | JWT access tokens + httpOnly refresh cookies (bcrypt passwords) |
| Tests | Jest + Supertest (`tests/` at repo root) |

## Conventions

```
src/frontend/src/
  api/           — client.js (central fetch, 401 refresh, loading tracker), domain modules
  components/ui/ — design system primitives
  context/       — AuthContext, ThemeContext, ToastContext
  pages/         — route-level views (dashboards, settings, tickets, admin, customer)
  hooks/         — useTicketFilters, useDebouncedSearch

src/backend/
  models/        — User, Ticket, Comment + index.js associations
  routes/        — auth, admin, dashboard, tickets
  controllers/   — request handlers
  middleware/    — authenticate, authorize, checkPermission, validate, errorHandler
  constants/     — roles, permissions, statusTransitions

database/migrations/   — Sequelize migrations (run from repo root)
database/seed-data/    — Demo seeders
tests/                 — Jest integration tests
```

- Env vars in `src/backend/.env` (see `.env.example`); never commit secrets
- `express-validator` via `middleware/validate.js`
- Update `api-contract.md` and `data-model.md` when changing API or schema
- Prefer minimal diffs; match existing patterns

## Current State (implemented)

| Area | Status |
|------|--------|
| Auth (JWT + refresh) | ✅ |
| RBAC (roles, permissions, isActive) | ✅ |
| Ticket CRUD + comments + status machine | ✅ |
| Admin APIs (reps, customers, dashboard stats) | ✅ |
| Settings API (profile, email, password) | ✅ |
| Frontend design system + dark mode | ✅ |
| Admin/rep ticket list + customer portal | ✅ |
| Representatives management UI | ✅ |
| Dashboard stats (`resolvedAt`) | ✅ |
| Settings page | ✅ |
| UX polish (loading bar, debounced search, breadcrumbs) | ✅ |
| Integration tests | ✅ 56 tests across 8 suites (auth, CRUD, RBAC, status machine, admin, dashboard, assignment) |
| Frontend automated tests | ❌ None |

## Key Files

| Doc | Purpose |
|-----|---------|
| `api-contract.md` | HTTP API reference |
| `data-model.md` | Schema and associations |
| `design-notes.md` | Architecture decisions |
| `ui-flow.md` | Routes and navigation |
| `acceptance-criteria.md` | Done vs pending checklist |
| `README.md` | Setup and run instructions |

## Commands (from `ai-practical-assessment/`)

```bash
npm run install:all
npm run db:migrate
npm run db:seed
npm run dev          # backend :3001 + frontend :5173
npm test
```

Demo password (seeded users): `Password123!`

