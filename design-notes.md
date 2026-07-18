# Design Notes

## Architecture Overview

Monorepo with three main layers:

```
┌─────────────────────────────────────────────────────────┐
│  React 18 + Vite (src/frontend/)                        │
│  Tailwind design system, React Router, AuthContext      │
└───────────────────────┬─────────────────────────────────┘
                        │ fetch + Bearer token
                        │ credentials: include (refresh cookie)
┌───────────────────────▼─────────────────────────────────┐
│  Express API (src/backend/)                             │
│  Routes → Controllers → Sequelize models                │
│  Middleware: authenticate, authorize, checkPermission   │
└───────────────────────┬─────────────────────────────────┘
                        │ tedious driver
┌───────────────────────▼─────────────────────────────────┐
│  Microsoft SQL Server                                   │
│  Users, Tickets, Comments                               │
└─────────────────────────────────────────────────────────┘
```

### Auth layer

| Concern | Implementation |
|---------|----------------|
| Access token | Short-lived JWT in memory (`AuthContext`); sent as `Authorization: Bearer` |
| Refresh token | httpOnly cookie (`path: /auth`, 7d); rotated on refresh |
| Session bootstrap | `POST /auth/refresh` on app load |
| 401 recovery | `api/client.js` — deduped silent refresh, single retry, loop guards |
| Session expiry UX | `AuthSessionBridge` — toast + redirect to `/login` with return path |
| Proactive refresh | Warning ~90s before JWT `exp` |
| Server trust | `authenticate` reloads user from DB; rejects deactivated accounts |

### API route groups

| Mount | File | Auth |
|-------|------|------|
| `/auth` | `routes/auth.js` | Mixed (public login/register; protected profile) |
| `/admin` | `routes/admin.js` | Admin only |
| `/dashboard` | `routes/dashboard.js` | Authenticated (role-scoped stats) |
| `/tickets` | `routes/tickets.js` | Authenticated + permission checks |
| `/health` | `app.js` | Public |

---

## Frontend Design

### Design token system (Tailwind)

Configured in `src/frontend/tailwind.config.js`:

| Token family | Usage |
|--------------|--------|
| `brand-*` | Primary teal accent (buttons, links, focus rings) |
| `surface-*` | Warm stone neutrals (backgrounds, borders, text) |
| `sidebar-*` | Dark sidebar shell |
| `status-*` / `priority-*` | Semantic badge colors (with `dark:` variants) |
| Typography | Inter — `display`, `h1`–`h3`, `body`, `label`, `caption` |

**Dark mode:** `darkMode: 'class'`; `ThemeContext` + blocking script in `index.html` to prevent flash; toggle in header and settings.

### Component structure

| Path | Purpose |
|------|---------|
| `components/ui/` | Design system primitives (Button, Badge, Modal, SlidePanel, Toast, Input, Skeleton, LoadingBar, Breadcrumbs, SearchInput, ThemeToggle, …) |
| `components/tickets/` | Ticket list feature (filter bar, table, detail panel, new ticket modal) |
| `components/admin/` | Representative management |
| `components/customer/` | Portal cards, status stepper, create modal |
| `components/layout/` | App shell (sidebar, header) |
| `components/auth/` | Route guards, session bridge |
| `context/` | AuthContext, ThemeContext, ToastContext |
| `hooks/` | `useTicketFilters`, `useDebouncedSearch`, `useDebounce` |
| `api/` | `client.js` (central fetch + loading tracker + 401 handling), domain modules |

### Ticket list (Admin / Representative)

- **Desktop:** sortable table, avatar cells, badges, relative timestamps
- **Mobile:** stacked card layout
- **Detail:** right-side slide panel (list context preserved)
- **Filters:** URL-synced (`search`, `status`, `priority`, `assignedTo`, `sortBy`, `sortOrder`, `page`, `ticket`)
- **Search:** 400ms debounce + inline "Searching…" indicator; stale-request guard via fetch generation counter

### Customer portal

- Status summary cards (from `/dashboard/stats`)
- Ticket card grid + FAB (mobile) / header CTA (desktop)
- Detail view: status stepper, conversation thread, optimistic comments
- No status change UI (server enforces 403)

### UX polish (global)

| Feature | Location |
|---------|----------|
| Loading bar | `LoadingBar` + `api/loadingTracker.js` wired into `apiFetch` |
| Debounced search | `useDebouncedSearch` + `SearchInput` |
| Dark mode | `ThemeContext` |
| Breadcrumbs | Role-aware paths in `constants/breadcrumbs.js` |

### Pagination trade-off

**Chosen: offset-based pagination (20/page)** — pairs with URL-driven filters; bookmarkable pages. See prior table in this doc; still the active approach.

---

## RBAC Permission Model

### Roles

`admin` | `representative` | `customer` (Sequelize ENUM on `Users.role`)

### Permission flags (JSON on `Users.permissions`)

Resolved at runtime via `user.getEffectivePermissions()`:

| Key | Admin | Rep default | Customer |
|-----|-------|-------------|----------|
| `canCreateTickets` | ✓ (implicit) | ✗ | ✓ |
| `canComment` | ✓ | ✓ | ✓ |
| `canChangeStatus` | ✓ | ✓ | ✗ |
| `canAssignTickets` | ✓ | configurable | ✗ |
| `canViewAllTickets` | ✓ | configurable | ✗ |

- **Admins:** `permissions` is `null`; all flags implied true
- **Representatives:** stored JSON merged over `REPRESENTATIVE_BASE_PERMISSIONS`
- **Customers:** explicit defaults in code

### Enforcement points

| Layer | Mechanism |
|-------|-----------|
| Routes | `authorize(ROLES.…)`, `checkPermission(KEY)` |
| Ticket list | `buildTicketListFilter(user)` in SQL `WHERE` |
| Ticket detail | `assertTicketAccess(user, ticket)` |
| Frontend | `ProtectedRoute`, `PermissionRoute` (UX only — not a security boundary) |

---

## Backend Design

### Ticket list (`GET /tickets`)

Paginated `findAndCountAll` with role-scoped filters, comma-separated multi-value `status`/`priority`, admin-only `assignedTo`, keyword `search`, `sortBy`/`sortOrder`.

### Status state machine

`constants/statusTransitions.js` — validated in `updateTicketStatus`. Customers cannot call status endpoint.

### Dashboard stats

`utils/dashboardStats.js` — shared resolution window (30 days).

| Endpoint | Audience | Metrics |
|----------|----------|---------|
| `GET /admin/dashboard-stats` | Admin | Open/in-progress count, active users by role, avg resolution |
| `GET /dashboard/stats` | Rep / Customer | Role-scoped subset |

### `resolvedAt` decision (not full status history)

**Problem:** Average resolution time needs the moment a ticket entered `resolved`, not just `updatedAt`.

**Options considered:**

| Approach | Pros | Cons |
|----------|------|------|
| **Status history table** | Full audit trail; accurate re-resolution | New table, migration, write on every transition |
| **`resolvedAt` column (chosen)** | Simple; one timestamp; enough for 30d avg | Re-opening from `resolved` clears timestamp; no history of multiple resolutions |

**Implementation:**

- Migration `20260119000001-add-resolved-at-to-tickets.js`
- `updateTicketStatus` sets `resolvedAt = now` when entering `resolved`; clears when leaving `resolved`
- Backfill: existing `resolved`/`closed` tickets get `resolvedAt = updatedAt`
- Avg resolution = `mean(resolvedAt - createdAt)` for tickets with `resolvedAt` in last 30 days

---

## Database Design

See `data-model.md` for full schema. Key points:

- **MSSQL** via Sequelize + `tedious`
- **No separate permissions table** — JSON column on `Users`
- **No status history table** — only `Ticket.resolvedAt`
- Model hooks on `Ticket` enforce active customer/rep FK targets

---

## Validation Strategy

- **Client:** forms (login, register, settings, ticket create/edit)
- **Server:** `express-validator` on routes; `HttpError` for business rules
- **ORM:** `beforeValidate` hooks on Ticket for FK role/active checks
- **Status:** state machine in controller

---

## Error Handling Strategy

- `HttpError` + `errorHandler.js` → JSON `{ error, details? }`
- Frontend: `ApiError` class; toasts; inline field errors; `ErrorState` for page-level failures

---

## Testing Strategy Link

See `test-strategy.md` and `test-results.md`.

---

## What Changed vs Original Design

The original scaffold described basic CRUD with TODO business logic and plain CSS. The current system adds JWT auth, full RBAC enforcement, Tailwind design system, role-specific UIs, dashboard analytics, settings, and global UX polish. See `implementation-plan.md` → **Actual vs Planned**.
