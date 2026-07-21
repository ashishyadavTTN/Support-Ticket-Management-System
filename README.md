# Support Ticket Management System

A full-stack support ticket platform built as an AI capability exercise. Customers submit and track requests; representatives and admins triage, assign, and resolve tickets with role-based access control (RBAC), JWT authentication, and role-specific UIs.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 6, React Router 6, Tailwind CSS 3 |
| Backend | Node.js, Express 4, Sequelize 6 |
| Database | **Microsoft SQL Server** (via `tedious` driver) |
| Auth | JWT access tokens (memory) + httpOnly refresh cookies |
| Tests | Jest + Supertest (backend); Vitest + Testing Library (frontend) |

## Prerequisites

- Node.js 18+ (tested with Node 22)
- SQL Server instance (local or Azure SQL) reachable from your machine
- `npm` (comes with Node)

## Setup Instructions

### 1. Clone and install

```bash
cd ai-practical-assessment
npm run install:all
```

This installs dependencies at the repo root, `src/backend/`, and `src/frontend/`.

### 2. Database setup

1. Create a database (default name: `support_tickets`).
2. Copy the backend env template:

```bash
cp src/backend/.env.example src/backend/.env
```

3. Edit `src/backend/.env` with your SQL Server credentials (see [Environment Variables](#environment-variables) below).
4. Run migrations and seed demo data **from the repo root**:

```bash
npm run db:migrate
npm run db:seed
```

### 3. Run locally

**Both servers (recommended):**

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Express) | http://localhost:3001 |
| Health check | http://localhost:3001/health |

The Vite dev server proxies `/auth`, `/admin`, `/dashboard`, `/tickets`, and `/health` to the backend on port **3001**. Cookies for refresh tokens require `credentials: 'include'` on API calls (already configured in the frontend client).

**Run individually:**

```bash
npm run dev:backend   # backend only
npm run dev:frontend  # frontend only
```

**Production-style frontend build:**

```bash
npm run build:frontend
```

Set `VITE_API_BASE_URL` to your backend origin if the frontend is not served behind the same proxy.

### 4. Run tests

**Backend** (from repo root — needs MSSQL + seed):

```bash
npm test
```

**Frontend** (Vitest + React Testing Library — no DB required):

```bash
npm run test:frontend
```

**Both:**

```bash
npm run test:all
```

See `test-results.md` for the latest recorded backend run output.

### Demo accounts

After seeding, all demo users share password **`Password123!`**:

| Email | Role |
|-------|------|
| `alice@example.com` | Admin |
| `bob@example.com` | Representative (assigned tickets only) |
| `diana@example.com` | Representative (view all + assign) |
| `carol@example.com` | Customer |

## Environment Variables

Configured in `src/backend/.env` (see `.env.example`):

| Variable | Purpose | Default |
|----------|---------|---------|
| `PORT` | Backend listen port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |
| `DB_HOST` | SQL Server host | `localhost` |
| `DB_PORT` | SQL Server port | `1433` |
| `DB_NAME` | Database name | `support_tickets` |
| `DB_USER` | SQL login | — |
| `DB_PASSWORD` | SQL password | — |
| `DB_ENCRYPT` | TLS for SQL connection | `true` |
| `DB_TRUST_SERVER_CERTIFICATE` | Trust self-signed cert (local dev) | `true` |
| `JWT_ACCESS_SECRET` | Access token signing secret | (change in prod) |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | (change in prod) |
| `JWT_ACCESS_EXPIRY` | Access token TTL | `1h` |
| `JWT_REFRESH_EXPIRY` | Refresh token TTL | `7d` |

Optional frontend variable:

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API origin when not using Vite proxy (empty = relative URLs) |

## Project layout

```
ai-practical-assessment/
├── src/frontend/          React app (Vite)
├── src/backend/           Express API
├── database/migrations/   Sequelize migrations
├── database/seed-data/    Demo seeders
├── tests/                 Jest integration tests
├── api-contract.md        API reference
├── data-model.md          Schema reference
└── ui-flow.md             Frontend navigation & UX
```

## Documentation

Assessment artifacts live at the repo root. Key technical references:

- `api-contract.md` — all HTTP endpoints
- `data-model.md` — Sequelize models and migrations
- `design-notes.md` — architecture and design decisions
- `ui-flow.md` — routes, navigation, and role-specific UX

## AI Capability Exercise

This repository documents an AI-assisted development assessment. Prompt logs are in `ai-prompts/`; workflow, reflection, and candidate info are in the root markdown files listed in the exercise structure.
