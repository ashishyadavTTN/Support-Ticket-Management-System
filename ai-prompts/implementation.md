# Implementation Prompts

| Prompt | AI Response Summary | Accepted | Changed | Rejected | Why |
|--------|---------------------|----------|---------|----------|-----|
| Scaffold Express backend: models (User, Ticket, Comment), routes/controllers stubbed with TODOs, express-validator, error middleware | Created `src/backend/` with Sequelize models, associations, ticket + comment routes, centralized `errorHandler.js` | Y | N | N | Business logic deliberately left as TODOs per spec |
| Scaffold React frontend: Vite, React Router (list/detail/new), API client, loading/error placeholders | Created pages, `src/api/tickets.js`, Vite proxy to `:3001`, plain CSS | Y | N | N | Lightweight stack as requested |
| Create Sequelize migrations + seed data for Users, Tickets, Comments | Three migrations + demo seeder with sample users/tickets/comments | Y | Y | N | Later replaced seed with RBAC personas (6 users, 6 tickets) |
| Root `package.json` scripts to install/run FE+BE, migrate, seed, test | `install:all`, `dev`, `db:migrate`, `db:seed`, `test` at repo root | Y | Y | N | Added `sequelize` + `tedious` to root after CLI resolution issue |
| RBAC: update User model (`role` enum, `passwordHash`, `isActive`, `permissions` JSON) | Updated `User.js`, added `constants/roles.js` and `constants/permissions.js`, `getEffectivePermissions()` helper | Y | N | N | Data layer only; `passwordHash` nullable, excluded from default scope |
| RBAC: migration `20260118000001-add-rbac-to-users.js` with backward compat | Adds columns, migrates `agent` → `representative`, backfills permissions for existing rows | Y | N | N | Non-destructive for existing DBs |
| RBAC: update seed — 1 Admin, 2 Reps (different perms), 3 Customers, distributed tickets | Rewrote `20260101000001-demo-data.js` with Bob (assigned-only) and Diana (view-all + assign) | Y | N | N | Enables permission testing without auth |
| Keep updating `ai-prompts/` folder as work progresses | Logging prompts across planning/design/implementation/testing/debugging/documentation files | Y | N | N | Assessment evidence requirement |
| Keep updating `.md` files with every prompt where required | User request — maintain prompt trail and technical notes in sync with each fix | Y | N | N | Ongoing assessment evidence |
| Implement JWT auth: register/login/refresh, middleware (authenticate, authorize, checkPermission), protect ticket routes, admin rep management | Added `auth` + `admin` routes, bcrypt passwords, access JWT (1h) + refresh httpOnly cookie (7d), server-side ticket filtering by role | Y | N | N | Auth layer on top of existing RBAC data model |
| Fix UI refresh returning 401 JSON on protected frontend routes | Updated `vite.config.js` with `spaHtmlBypass` on `/tickets`, `/admin`, `/dashboard` proxies so browser refreshes load `index.html`; `AuthProvider` bootstrap via `/auth/refresh` then resumes normally | Y | N | N | Frontend-only fix; no backend or auth flow changes needed |
