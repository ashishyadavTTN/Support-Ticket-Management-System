# Reflection

## What I Built

A production-style support ticket system beyond the original Core scaffold:

- **Core:** Ticket create/list/detail/update, comments, status state machine, keyword search + status filter (admin/rep UI), MSSQL persistence, backend validation, meaningful UI error states
- **Stretch:** JWT auth with refresh cookies, RBAC with granular rep permissions, admin rep management, role-specific dashboards and UIs, pagination/sorting/multi-filter, `resolvedAt` analytics, auto-assignment to lowest-queue rep

56 backend integration tests verify auth, RBAC, CRUD, the full state machine (including terminal states), and assignment rules.

## How I Used AI

Cursor was the primary collaborator. I maintained persistent context in `tool-specific/cursor-workflow/` and logged prompts in `ai-prompts/` with accept/change/reject notes.

Typical loop: define scope in `spec.md` → implement one slice → run `npm test` → update `api-contract.md` / `data-model.md` → log the prompt.

I used AI heavily for scaffolding and boilerplate but manually verified security boundaries (SQL-level ticket filters, password hash scope, status endpoint separation).

## What Worked Well

1. **Layered delivery** — data model → auth → API → UI prevented rework
2. **Persistent project context** — `project-context.md` reduced repeated explanations across sessions
3. **Debugging notes** — documenting Vite proxy vs SPA overlap saved time on similar issues
4. **Integration tests over unit tests** — faster confidence for an exercise deadline with clear API contracts

## What I Would Do Differently

1. **Sync docs with code continuously** — `acceptance-criteria.md` and `test-strategy.md` went stale while tests were implemented; a final audit caught this
2. **Smaller commits** — one large initial commit makes it hard to show iteration; I'd commit per milestone (auth, RBAC, tests)
3. **Earlier test implementation** — placeholders were fine initially, but filling them sooner would have caught the MSSQL JSON string permissions bug earlier
4. **Frontend tests** — at least a few component tests for `TicketFilterBar` and login forms would strengthen the submission

## Skills Demonstrated

- Full-stack implementation with clear API contracts and schema documentation
- Security-aware design (server-enforced RBAC, httpOnly refresh tokens, no password hash leakage)
- State machine enforcement on backend with matching frontend UX
- AI-assisted workflow with documented prompts, debugging, and honest gap acknowledgment
- Test-driven validation of critical paths (state machine, customer isolation, auth)

## Trade-offs

| Decision | Chosen | Alternative | Why |
|----------|--------|-------------|-----|
| Permissions storage | JSON on User | Join table | Simpler for fixed boolean flags; fewer joins |
| Resolution timing | `resolvedAt` column | Status history table | Enough for 30-day avg; less migration complexity |
| Customer search/filter | API only | UI on portal | Time; admin/rep list demonstrates feature |
| Test tier | Integration only | Unit + E2E | Best ROI for exercise scope |
