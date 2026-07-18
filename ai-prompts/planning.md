# Planning Prompts

| Prompt | AI Response Summary | Accepted | Changed | Rejected | Why |
|--------|---------------------|----------|---------|----------|-----|
| Scaffold full-stack Support Ticket Management System (React/Vite, Express, Sequelize/MSSQL, Jest) with exact folder structure, markdown templates, stubbed routes, and no full business logic yet | Proposed monorepo layout under `ai-practical-assessment/`, root scripts for install/dev/migrate/test, backend MVC folders, frontend pages + API client, assessment markdown with header placeholders | Y | N | N | Matched exercise spec; kept scope to skeleton only |
| RBAC: extend system with role-based access control — data layer only | Planned User model changes, migration strategy, seed personas | Y | N | N | Clear separation of data layer vs future auth/API enforcement |
| JWT-based authentication on backend with role/permission middleware and protected routes | Full auth flow design: public register (customer only), login, refresh cookie, admin rep management, ticket route guards | Y | N | N | Builds on RBAC data model without implementing frontend auth yet |
