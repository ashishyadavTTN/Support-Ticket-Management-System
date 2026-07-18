# Data Model

Source of truth derived from Sequelize models (`src/backend/models/`), associations (`models/index.js`), and migrations (`database/migrations/`).

**Database:** Microsoft SQL Server (`dialect: 'mssql'`, driver: `tedious`).

**There is no status-history table.** Resolution timing uses `Tickets.resolvedAt` only.

---

## Users (`Users` table)

| Column | Sequelize type | Nullable | Default | Notes |
|--------|----------------|----------|---------|-------|
| `id` | INTEGER PK | No | auto-increment | |
| `name` | STRING(100) | No | — | Display name |
| `email` | STRING(255) | No | — | Unique |
| `role` | ENUM(`admin`, `representative`, `customer`) | No | — | Migrated from legacy `agent` → `representative` |
| `passwordHash` | STRING(255) | Yes | — | bcrypt; excluded from default scope |
| `isActive` | BOOLEAN | No | `true` | `false` = cannot log in |
| `permissions` | JSON | Yes | — | Representative overrides; `null` for admin |
| `createdAt` | DATE | No | — | Sequelize timestamps |
| `updatedAt` | DATE | No | — | Sequelize timestamps |

### Default scope & scopes

- **Default scope:** excludes `passwordHash` from queries
- **`withPassword` scope:** includes `passwordHash` (login, password change)

### Instance methods

| Method | Returns |
|--------|---------|
| `getEffectivePermissions()` | Merged permission object for role + JSON overrides |
| `isAdmin()` | `role === 'admin'` |
| `isRepresentative()` | `role === 'representative'` |
| `isCustomer()` | `role === 'customer'` |

### Permissions JSON keys

| Key | Admin (implicit) | Rep default | Customer default |
|-----|------------------|-------------|------------------|
| `canCreateTickets` | true | false | true |
| `canComment` | true | true | true |
| `canChangeStatus` | true | true | false |
| `canAssignTickets` | true | false | false |
| `canViewAllTickets` | true | false | false |

Resolved in `constants/permissions.js` → `resolvePermissions(role, permissions)`.

**Seed personas:** Bob (assigned-only), Diana (view-all + assign). See seed file.

---

## Tickets (`Tickets` table)

| Column | Sequelize type | Nullable | Default | Notes |
|--------|----------------|----------|---------|-------|
| `id` | INTEGER PK | No | auto-increment | |
| `title` | STRING(255) | No | — | |
| `description` | TEXT | Yes | — | |
| `priority` | STRING(20) | No | `'medium'` | `low`, `medium`, `high`, `critical` |
| `status` | STRING(30) | No | `'open'` | See status values below |
| `resolvedAt` | DATE | Yes | — | Set on transition **to** `resolved`; cleared when leaving `resolved` |
| `assignedTo` | INTEGER FK → `Users.id` | Yes | — | Must be active **representative** |
| `createdBy` | INTEGER FK → `Users.id` | No | — | Must be active **customer** |
| `createdAt` | DATE | No | — | |
| `updatedAt` | DATE | No | — | |

### Status values

`open` | `in_progress` | `resolved` | `closed` | `cancelled`

Transitions enforced in `constants/statusTransitions.js` (see `api-contract.md`).

### Model hooks (`beforeValidate`)

1. `createdBy` must reference an active user with `role = 'customer'`
2. `assignedTo` must reference an active user with `role = 'representative'`, or be `null`

---

## Comments (`Comments` table)

| Column | Sequelize type | Nullable | Default | Notes |
|--------|----------------|----------|---------|-------|
| `id` | INTEGER PK | No | auto-increment | |
| `ticketId` | INTEGER FK → `Tickets.id` | No | — | CASCADE on update |
| `message` | TEXT | No | — | |
| `createdBy` | INTEGER FK → `Users.id` | No | — | Any authenticated author with ticket access |
| `createdAt` | DATE | No | — | |
| `updatedAt` | — | — | — | **Disabled** (`updatedAt: false`) |

---

## Associations (Sequelize)

```
User
 ├── hasMany Ticket  (foreignKey: createdBy,  as: 'createdTickets')
 ├── hasMany Ticket  (foreignKey: assignedTo, as: 'assignedTickets')
 └── hasMany Comment (foreignKey: createdBy,  as: 'comments')

Ticket
 ├── belongsTo User  (foreignKey: createdBy,  as: 'creator')
 ├── belongsTo User  (foreignKey: assignedTo, as: 'assignee')
 └── hasMany Comment (foreignKey: ticketId,   as: 'comments')

Comment
 ├── belongsTo Ticket (foreignKey: ticketId,  as: 'ticket')
 └── belongsTo User   (foreignKey: createdBy, as: 'author')
```

### API include aliases

Ticket detail/list responses typically include:

- `creator` / `assignee` (User, attributes: `id`, `name`, `email`, `role`)
- `comments` with nested `author` (`id`, `name`)

---

## Migrations (chronological)

| File | Purpose |
|------|---------|
| `20260101000001-create-users.js` | `Users` table (initial `role` as STRING, default `agent`) |
| `20260101000002-create-tickets.js` | `Tickets` table |
| `20260101000003-create-comments.js` | `Comments` table |
| `20260118000001-add-rbac-to-users.js` | `passwordHash`, `isActive`, `permissions`; role enum migration; backfill |
| `20260119000001-add-resolved-at-to-tickets.js` | `resolvedAt`; backfill from `updatedAt` for resolved/closed |

Run from repo root: `npm run db:migrate`

---

## Seed data

File: `database/seed-data/20260101000001-demo-data.js`

| ID | Name | Role | Notes |
|----|------|------|-------|
| — | Alice Admin | admin | `permissions: null` |
| — | Bob Representative | representative | Assigned tickets only |
| — | Diana Representative | representative | View all + assign |
| — | Carol Customer | customer | |
| — | Dave Customer | customer | |
| — | Eve Customer | customer | |

6 tickets, comments from reps and customers. Password for all: `Password123!`

Run: `npm run db:seed`

---

## What is NOT in the schema

| Concept | Status |
|---------|--------|
| Status history / audit log table | **Not implemented** |
| Separate permissions / roles tables | **Not implemented** (JSON on User) |
| Refresh token storage table | **Not implemented** (stateless JWT in httpOnly cookie) |
| Ticket attachments | **Not implemented** |
