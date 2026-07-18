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

## Cursor-Specific Tips

- **Attach context explicitly:** start sessions by referencing `project-context.md`, `api-contract.md`, and `data-model.md` so the agent has current stack/API state instead of guessing.
- **Ask for a plan before code** on multi-file changes; review the proposed diff surface before letting it edit.
- **Review security-sensitive diffs manually** — SQL `where` filters, password-hash scope, JWT/cookie handling. Do not accept UI-only access control.
- **Run `npm test` after accepting backend diffs** as the primary validation loop for AI-generated changes.
- **Log significant prompts** (accept/change/reject + why) in `ai-prompts/` as you go, not at the end.
