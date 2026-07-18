# Testing Prompts

| Prompt | AI Response Summary | Accepted | Changed | Rejected | Why |
|--------|---------------------|----------|---------|----------|-----|
| Include placeholder Jest + Supertest integration test for ticket status transitions (pending/TODO) | Created `tests/ticket-status-transitions.integration.js` with `it.todo` blocks + passing `/health` test | Y | Y | N | Fixed `describe.todo` → `it.todo` (Jest has no `describe.todo`) |
| Jest not finding tests in repo-root `tests/` folder | Set `rootDir: "../.."`, `modulePaths` to backend `node_modules` in backend `package.json` jest config | Y | N | N | Tests live at repo root per spec; supertest resolves from backend deps |
| Verify scaffold still passes tests after RBAC model changes | Re-ran `npm test` — 1 passed, 3 todo | Y | N | N | RBAC changes are data-layer only; health check unaffected |
| **Implement full integration test suites for auth, CRUD, RBAC, admin, dashboard** | Prompt: "Replace all `it.todo` in tests/ with real Supertest cases using seeded users from testApi.js. Cover login, customer isolation, status machine valid+invalid paths, and admin rep management." → Created 7 suite files with login helpers | Y | Y | N | AI initially used wrong error message assertions; fixed to match actual `errorHandler` output |
| **Fix RBAC tests failing on MSSQL permissions** | Prompt: "ticket-rbac tests show canViewAllTickets false for Diana — permissions JSON may be a string from MSSQL" → AI suggested parsing in `getEffectivePermissions()` | N | Y | N | Correct diagnosis; I applied parse logic and re-ran tests |
| **Add missing state machine cases from audit** | Prompt: "Add integration tests for open→cancelled, in_progress→cancelled, terminal status rejection, and GET /tickets?status=open. Do not duplicate existing happy-path chain test." → 4 new cases in status + CRUD suites | Y | N | N | Closes mandatory Core checklist gaps identified in pre-submission review |

## Iteration example (permissions bug)

**First prompt:** "Why does `ticket-rbac.integration.js` fail for Diana's canViewAllTickets?"

**AI response:** Suggested permissions were not seeded correctly.

**My correction:** Checked seed file — permissions were correct. Inspected runtime value in test — MSSQL returned JSON as string.

**Second prompt:** "Fix getEffectivePermissions to parse string permissions before merging defaults."

**Result:** RBAC tests pass; logged fix in `test-results.md`.
