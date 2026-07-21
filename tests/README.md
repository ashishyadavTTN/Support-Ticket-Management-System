# Backend Tests

Backend tests using **Jest** (+ **Supertest** for API integration). Integration tests import the Express `app` directly (no live server required). A small unit tier covers pure logic without any database.

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
| `setup.js` | Loads env, verifies DB connectivity (warns if unavailable so unit tests still run), closes connection after suite |
| `helpers/testApi.js` | Login helper, authenticated request wrapper, seeded user emails |
| `unit/statusTransitions.test.js` | Pure state-machine logic (valid/invalid/terminal transitions) — no DB required |
| `health.integration.js` | `GET /health` |
| `auth.integration.js` | Register, login, refresh, logout, profile, password |
| `ticket-status-transitions.integration.js` | State machine (valid, invalid, terminal, `resolvedAt`, 403/404) |
| `ticket-crud.integration.js` | Create, list, search, status filter, detail, update, comments |
| `ticket-rbac.integration.js` | Role scoping, access boundaries, admin route protection |
| `ticket-assignment.integration.js` | Auto-assign, rep `canCreateTickets`, customer list gating |
| `ticket-attachments.integration.js` | Image upload on create/comment, fetch, validation |
| `admin.integration.js` | Representatives, customers, permissions, deactivation |
| `dashboard.integration.js` | Admin and role-scoped dashboard stats |
| `unit/formatTicketId.test.js` | Short UUID display formatting — no DB required |

**Total:** 9 integration suites + 2 unit suites (**85 tests**). See `test-results.md` for the latest recorded run.

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
