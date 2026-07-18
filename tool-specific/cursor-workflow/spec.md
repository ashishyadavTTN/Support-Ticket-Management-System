# Specification

## Overview

Support Ticket Management System — full-stack role-based app for handling support requests.

| Role | Capabilities |
|------|--------------|
| **Customer** | Register, create tickets, view own tickets, comment, track status |
| **Representative** | View assigned (or all, if permitted) tickets, update fields, change status, comment |
| **Admin** | Full ticket visibility, manage representatives, org dashboard, create tickets on behalf of customers |

**Auth:** JWT access tokens (in memory) + httpOnly refresh cookies. Passwords hashed with bcrypt.

**Stack:** React 18 + Vite 6 (frontend), Express 4 + Sequelize 6 + MSSQL (backend).

Full API and schema details live in `api-contract.md` and `data-model.md` at the repo root.

---

## API Endpoints

### Auth (`/auth`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/register` | Public | Customer self-registration |
| POST | `/auth/login` | Public | Sign in |
| POST | `/auth/refresh` | Cookie | Rotate access token |
| POST | `/auth/logout` | Bearer | Clear session |
| GET | `/auth/me` | Bearer | Current user |
| PATCH | `/auth/profile` | Bearer | Update name |
| PATCH | `/auth/email` | Bearer | Change email |
| PATCH | `/auth/password` | Bearer | Change password |

### Admin (`/admin`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/representatives` | List reps (`?activeOnly=true` for assign dropdowns) |
| POST | `/admin/representatives` | Create representative |
| PATCH | `/admin/representatives/:id/permissions` | Update permissions / active status |
| GET | `/admin/customers` | List customers (ticket creation) |
| GET | `/admin/dashboard-stats` | Org-wide metrics |
| GET | `/admin/default-permissions` | Default rep permission template |

### Dashboard (`/dashboard`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/dashboard/stats` | Role-scoped stats (rep or customer) |

### Tickets (`/tickets`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/tickets` | Create ticket |
| GET | `/tickets` | List tickets (search, filter, sort, paginate) |
| GET | `/tickets/assignees` | Active reps for assign dropdown |
| GET | `/tickets/:id` | Ticket detail + comments |
| PUT | `/tickets/:id` | Update title, description, priority, assignee |
| PATCH | `/tickets/:id/status` | Status transition (state machine) |
| POST | `/tickets/:id/comments` | Add comment |
| GET | `/tickets/:id/comments` | List comments |

### Health

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness check |

**Status machine** (`PATCH /tickets/:id/status`):

| From | Allowed to |
|------|------------|
| `open` | `in_progress`, `cancelled` |
| `in_progress` | `resolved`, `open`, `cancelled` |
| `resolved` | `closed`, `in_progress` |
| `closed` | (terminal) |
| `cancelled` | (terminal) |

Setting status to `resolved` sets `resolvedAt`; leaving `resolved` clears it.

---

## Data Model

### Users

- Roles: `admin`, `representative`, `customer`
- `permissions` JSON on representatives (overrides role defaults)
- `isActive` — deactivated users cannot log in

### Tickets

- FK `createdBy` → User (customer)
- FK `assignedTo` → User (representative, nullable)
- Fields: `title`, `description`, `status`, `priority`, `resolvedAt`, timestamps

### Comments

- FK `ticketId` → Ticket, `authorId` → User
- Field: `message`, timestamps

No status-history table — resolution timing uses `Tickets.resolvedAt` only.

---

## UI Pages

### Public

| Route | Page |
|-------|------|
| `/login` | Sign in |
| `/register` | Customer registration |

### Admin

| Route | Page |
|-------|------|
| `/admin/dashboard` | Org stats |
| `/tickets` | All tickets (filters, search, slide panel) |
| `/admin/users` | Representatives management |
| `/admin/settings` | Profile, password, theme |

### Representative

| Route | Page |
|-------|------|
| `/rep/dashboard` | Assigned open tickets + resolution stats |
| `/tickets` | Scoped ticket list |
| `/rep/settings` | Profile, password, theme |

### Customer portal

| Route | Page |
|-------|------|
| `/customer/dashboard` | Status summary cards + ticket grid |
| `/tickets` | Same portal (My Requests) |
| `/tickets/:id` | Request detail, status stepper, conversation |
| `/tickets/new` | Redirects to `?create=true` (opens create modal) |
| `/customer/settings` | Profile, password, theme |

**Customer create flow:** "Get help" modal (`CustomerCreateTicketModal`) — title, description, priority.

**Shared UI primitives:** `Modal`, `SlidePanel`, `Input`, `Textarea`, `Select`, `Button`, `Toast`, dark mode via `ThemeContext`.

---

## Out of Scope (for now)

- Status history / audit log table
- Email notifications or webhooks
- File attachments on tickets or comments
- Real-time updates (WebSockets / SSE)
- Multi-tenant organizations
- Frontend automated test suite
- Production deployment / CI pipeline
