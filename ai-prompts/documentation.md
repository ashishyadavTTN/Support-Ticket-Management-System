# Documentation Prompts

| Prompt | AI Response Summary | Accepted | Changed | Rejected | Why |
|--------|---------------------|----------|---------|----------|-----|
| Create all assessment markdown files with section headers + one-line placeholders | README, candidate-info, tool-workflow, requirements-analysis, acceptance-criteria, implementation-plan, design-notes, api-contract, data-model, ui-flow, test-strategy, etc. | Y | N | N | Per exercise template; to be filled in during assessment |
| Update `data-model.md` with RBAC schema (roles, permissions JSON, relationships, seed summary) | Full tables for User/Ticket/Comment, permissions matrix, ER description, migration notes, seed persona table | Y | N | N | Documents JSON-over-join-table decision and test personas |
| Update `api-contract.md` with auth + admin endpoints, token expiry, RBAC access rules on ticket routes | Documented register/login/refresh/logout/me, admin rep CRUD, updated ticket endpoints with auth requirements | Y | N | N | Single source of truth for frontend integration |
| Update `debugging-notes.md` with JWT + Sequelize middleware gotchas | Cookie credentials/CORS, withPassword scope, DB reload for isActive, SQL-level ticket filtering | Y | N | N | Non-obvious integration notes for assessment evidence |
| Keep updating `.md` files with every prompt where required | Logged SPA refresh / Vite proxy fix in `ai-prompts/debugging.md`, `ai-prompts/implementation.md`, `ai-prompts/documentation.md`, and `debugging-notes.md` | Y | N | N | Assessment evidence — prompt trail stays in sync with fixes |
| Update `debugging-notes.md` with Vite SPA refresh / proxy overlap issue | Documented `Accept: text/html` bypass pattern, affected proxy paths, and distinction from real auth/session failures | Y | N | N | Common dev-server pitfall when API and SPA share URL prefixes |
