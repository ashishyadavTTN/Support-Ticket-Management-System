# Database Setup Notes

## DB Choice Justification

**Microsoft SQL Server** was required by the exercise scaffold. Sequelize with the `tedious` driver provides migrations, model hooks, and seed scripts while matching a common enterprise stack. SQLite would simplify local setup but was not the specified target.

## Prerequisites

- SQL Server 2019+ (local instance, SQL Server Express, or Azure SQL)
- TCP/IP enabled on port **1433** (default)
- A login with permission to create databases and tables

## Setup Instructions

### Option A — Local SQL Server (Windows)

1. Install [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) or use an existing instance.
2. Open **SQL Server Configuration Manager** → enable **TCP/IP** for your instance → restart the service.
3. Create the database (SSMS or `sqlcmd`):

```sql
CREATE DATABASE support_tickets;
```

4. Create a SQL login or use Windows auth and note `DB_USER` / `DB_PASSWORD`.

### Option B — Azure SQL

1. Create an Azure SQL server and database named `support_tickets`.
2. Set firewall rule for your client IP.
3. Use the Azure connection host as `DB_HOST`; set `DB_ENCRYPT=true`.

### Application configuration

```bash
cp src/backend/.env.example src/backend/.env
```

Edit `src/backend/.env`:

| Variable | Notes |
|----------|-------|
| `DB_HOST` | `localhost` or Azure server hostname |
| `DB_PORT` | `1433` |
| `DB_NAME` | `support_tickets` |
| `DB_USER` / `DB_PASSWORD` | Your SQL login |
| `DB_TRUST_SERVER_CERTIFICATE` | `true` for local dev with self-signed certs |

## Migration Commands

From repo root (`ai-practical-assessment/`):

```bash
npm run db:migrate
```

Migrations run in order:

1. `create-users`
2. `create-tickets`
3. `create-comments`
4. `add-rbac-to-users`
5. `add-resolved-at-to-tickets`

Undo last migration:

```bash
npm run db:migrate:undo
```

## Seed Command

```bash
npm run db:seed
```

Seeds 6 users (admin, 2 reps, 3 customers), 6 tickets, and sample comments. All accounts use password **`Password123!`**.

Undo seed:

```bash
npm run db:seed:undo
```

## Environment Variable Example

See `src/backend/.env.example`. Never commit `src/backend/.env` — it is listed in `.gitignore`.

## Local Run Steps

```bash
npm run install:all
# configure src/backend/.env
npm run db:migrate
npm run db:seed
npm run dev
```

- Backend: http://localhost:3001/health
- Frontend: http://localhost:5173

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `Failed to connect to localhost:1433` | SQL Server not running or TCP disabled | Start service; enable TCP/IP |
| `Unable to resolve sequelize package` | Root deps missing | Run `npm install` at repo root |
| `Login failed for user` | Wrong `DB_USER` / `DB_PASSWORD` | Verify credentials in SSMS |
| Tests fail on login | Seed not run | `npm run db:seed` |

## Test database note

Integration tests use the same database configured in `.env`. They create and destroy temporary tickets/users where needed. For a clean slate before a test run:

```bash
npm run db:seed:undo
npm run db:seed
npm test
```
