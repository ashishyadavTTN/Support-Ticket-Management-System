# Debugging Prompts

| Prompt | AI Response Summary | Accepted | Changed | Rejected | Why |
|--------|---------------------|----------|---------|----------|-----|
| `npm run db:migrate` fails: "Unable to resolve sequelize package" at repo root | Root cause: `sequelize-cli` runs from `ai-practical-assessment/` but `sequelize`/`tedious` were only in `src/backend/node_modules` | Y | N | N | CLI resolves packages from cwd |
| Fix sequelize-cli resolution | Added `sequelize`, `tedious`, `dotenv` to root `devDependencies`; run `npm install` at root | Y | N | N | Minimal fix; keeps migrate/seed scripts at root per `.sequelizerc` |
| Post-fix migrate error: "Failed to connect to localhost:1433" | CLI now loads config correctly; failure is environment (SQL Server not running or wrong `.env`) | Y | N | N | Not a code bug — user must start MSSQL and verify `src/backend/.env` |
| UI refresh shows `{"error":"Authentication required. Provide a valid Bearer token."}` | Root cause: Vite dev proxy forwarded browser navigations (e.g. `/tickets`, `/admin/users`) to the Express API; GET with `Accept: text/html` hit protected routes and returned raw 401 JSON instead of the SPA | Y | N | N | Not an auth/session bug — proxy path overlap with frontend routes |
| Fix refresh auth error from frontend | Added `spaHtmlBypass` in `vite.config.js` — serve `/index.html` when `Accept` includes `text/html`; API `fetch` calls still proxy to backend | Y | N | N | Standard SPA dev-server pattern; restart Vite after config change |
