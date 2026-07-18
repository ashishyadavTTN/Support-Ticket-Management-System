# Integration Tests

Backend API integration tests using **Jest + Supertest**. Tests import the Express `app` directly (no live server required).

## Prerequisites

- MSSQL database configured in `src/backend/.env`
- Migrations applied: `npm run db:migrate`
- Seed data loaded: `npm run db:seed`

## Run

From repo root (`ai-practical-assessment/`):

```bash
npm test
```

## Structure

| File | Coverage |
|------|----------|
| `setup.js` | Loads env, connects DB, closes connection after suite |
| `helpers/testApi.js` | Login helper, authenticated request wrapper, seeded user emails |
| `health.integration.js` | `GET /health` |
| `auth.integration.js` | Register, login, refresh, logout, profile, password |
| `ticket-status-transitions.integration.js` | Status state machine, `resolvedAt`, 404/403 |
| `ticket-crud.integration.js` | Create, list, detail, update, comments |
| `ticket-rbac.integration.js` | Role scoping, access boundaries, admin route protection |
| `admin.integration.js` | Representatives, customers, permissions, deactivation |
| `dashboard.integration.js` | Admin and role-scoped dashboard stats |

## Seeded test users

Password for all: `Password123!`

| Email | Role |
|-------|------|
| `alice@example.com` | admin |
| `bob@example.com` | representative |
| `diana@example.com` | representative |
| `carol@example.com` | customer |
| `dave@example.com` | customer |
| `eve@example.com` | customer |

Tests that create data use unique emails and clean up temporary tickets where possible.
