# Testing Prompts

| Prompt | AI Response Summary | Accepted | Changed | Rejected | Why |
|--------|---------------------|----------|---------|----------|-----|
| Include placeholder Jest + Supertest integration test for ticket status transitions (pending/TODO) | Created `tests/ticket-status-transitions.integration.js` with `it.todo` blocks + passing `/health` test | Y | Y | N | Fixed `describe.todo` → `it.todo` (Jest has no `describe.todo`) |
| Jest not finding tests in repo-root `tests/` folder | Set `rootDir: "../.."`, `modulePaths` to backend `node_modules` in backend `package.json` jest config | Y | N | N | Tests live at repo root per spec; supertest resolves from backend deps |
| Verify scaffold still passes tests after RBAC model changes | Re-ran `npm test` — 1 passed, 3 todo | Y | N | N | RBAC changes are data-layer only; health check unaffected |
