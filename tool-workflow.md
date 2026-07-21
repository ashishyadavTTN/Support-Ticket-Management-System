# Tool Workflow

How I used AI (primarily **Cursor**) across the Support Ticket Management assessment.

## Primary AI Tool

**Cursor** — used for the full lifecycle: scaffolding, design decisions, implementation, debugging, test writing, and documentation. Chosen because it keeps project context in-repo (`tool-specific/cursor-workflow/`) and can run terminal commands and edit multiple files in one session.

## Context-Sharing Approach

At the start of each session I pointed the agent at:

- `tool-specific/cursor-workflow/project-context.md` — stack, conventions, current state
- `api-contract.md` and `data-model.md` — when changing API or schema
- `acceptance-criteria.md` — to stay aligned with Core vs stretch scope

For larger tasks I pasted the exercise brief requirements and asked for a plan before code. I updated `project-context.md` and `tasks.md` after major milestones so later sessions did not re-scaffold work already done.

## Requirement Analysis

AI helped break the exercise into layers: data model → auth → ticket API → role-specific UIs. I used it to compare options (e.g. permissions JSON vs join table) and documented the decision in `design-notes.md`.

I did **not** let AI redefine Core scope. When the scaffold only had ticket CRUD, I explicitly asked to complete state machine and validation before adding stretch features. RBAC and JWT were added incrementally with `api-contract.md` updated each time.

## Planning & Design

Planning prompts produced `implementation-plan.md` structure and the Cursor `spec.md` / `tasks.md` checklists. Design prompts covered:

- Status state machine (`constants/statusTransitions.js`)
- Server-side ticket scoping (`buildTicketListFilter`, `assertTicketAccess`)
- `resolvedAt` vs full status-history table (chose column for simplicity)

I reviewed AI architecture suggestions against the exercise rubric before accepting — e.g. rejected double `User.init()` in an early RBAC draft (see `ai-prompts/code-review.md`).

## Code Generation

AI generated scaffold code, migrations, React components, and middleware. My pattern:

1. Ask for one focused slice (e.g. "protect ticket routes with authenticate + checkPermission")
2. Read the diff — especially security boundaries and Sequelize hooks
3. Run `npm test` or manual smoke test
4. Log the prompt in `ai-prompts/implementation.md`

I accepted most backend structure suggestions but manually verified auth flow, cookie paths, and SQL-level filters.

## Validation

- **Automated:** `npm test` after backend changes (85 tests / 11 suites at latest run — see `test-results.md`)
- **Manual:** login as each seeded role, create ticket, change status, verify 403 for wrong role
- **Docs:** compared `api-contract.md` to actual routes after each API change

When AI suggested UI-only access control, I rejected it and required server enforcement in controllers.

## Testing

AI helped set up Jest + Supertest from repo-root `tests/`. I started with placeholder `it.todo` tests, then asked it to implement full suites once auth and RBAC were stable.

I validated tests against real behavior — e.g. MSSQL sometimes returns `permissions` JSON as a string, which broke RBAC tests until `User.getEffectivePermissions()` parsed it (logged in `test-results.md`).

## Debugging

See `debugging-notes.md` for documented issues. AI was most useful for:

- Sequelize CLI package resolution at repo root
- Vite proxy returning 401 JSON on browser refresh (SPA vs API path overlap)
- Refresh cookie + CORS + `credentials: 'include'`

I always asked for root cause before applying fixes, and recorded problem → investigation → fix in `debugging-notes.md`.

## Code Review

Self-review with AI before considering a feature done:

- Security: password hash scope, JWT reload from DB, ticket list filtered in SQL
- Consistency: status changes only via `PATCH /tickets/:id/status`
- Docs drift: stale checkboxes in `acceptance-criteria.md` caught during final audit

Findings and fixes are in `code-review-notes.md` and `review-fixes.md`.

## Information Avoided

I did **not** share with AI:

- Real database passwords or production JWT secrets (only `.env.example` placeholders)
- Employer or client identifiers
- Personal email addresses beyond demo `@example.com` seeds

Local `src/backend/.env` stays gitignored. Demo credentials (`Password123!`) are intentional and documented in README.

## Reuse in Real Projects

I would reuse:

1. **`project-context.md` + `spec.md` + `tasks.md`** — persistent context for long-running AI sessions
2. **Prompt log tables** in `ai-prompts/` — accepted/changed/rejected with rationale
3. **`debugging-notes.md` format** — problem, investigation, fix, not just "fixed bug"
4. **Central API client** with 401 refresh deduplication pattern from `src/frontend/src/api/client.js`
