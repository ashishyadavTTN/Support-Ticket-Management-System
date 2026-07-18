# Cursor Rules & Instructions

## Persistent Project Context

At session start, reference `tool-specific/cursor-workflow/project-context.md` plus `api-contract.md` and `data-model.md` for accurate stack and API state.

## Stack & Conventions

Use this snippet as a starter `.cursor/rules` entry (or project instructions):

```markdown
# Support Ticket Management System

## Stack
- Frontend: React 18 + Vite 6, React Router 6, Tailwind CSS 3
- Backend: Node.js + Express 4
- ORM: Sequelize 6 with MSSQL dialect (`tedious`)
- Auth: JWT access tokens (memory) + httpOnly refresh cookies; bcrypt passwords
- Tests: Jest + Supertest (backend integration tests in `tests/`)

## Structure
- `src/frontend/src/` — React app (pages, components, api/, context/, hooks/)
- `src/backend/` — Express app (`models/`, `routes/`, `controllers/`, `middleware/`, `config/`)
- `database/migrations/` — Sequelize migrations (run from repo root)
- `database/seed-data/` — Sequelize seeders
- Root markdown files — assessment documentation

## Conventions
- Central API client: `src/frontend/src/api/client.js` (401 refresh, loading tracker)
- Auth middleware chain: `authenticate` → `authorize` / `checkPermission`
- Ticket access: `buildTicketListFilter`, `assertTicketAccess` (server-enforced RBAC)
- Status transitions: `constants/statusTransitions.js` (do not bypass via PUT)
- Env vars in `src/backend/.env` (see `.env.example`); never commit secrets
- Match existing naming and folder patterns; minimal diffs
- Update `api-contract.md` and `data-model.md` when changing API or schema

## Commands (from `ai-practical-assessment/`)
- `npm run install:all` — install root, backend, frontend deps
- `npm run dev` — backend :3001 + frontend :5173 (Vite proxies /auth, /admin, /dashboard, /tickets, /health)
- `npm run db:migrate` / `npm run db:seed` — database setup (from repo root)
- `npm test` — Jest tests
```

## Session Workflow

1. Read `project-context.md` for current implementation state
2. Implement one focused task
3. Validate (build, manual test, or `npm test`)
4. Log significant prompts in `ai-prompts/` (candidate responsibility)

<!-- Add your own Cursor-specific tips below. -->
