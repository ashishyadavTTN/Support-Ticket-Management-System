# API Contract

All authenticated endpoints require `Authorization: Bearer <accessToken>` unless noted.

**Access token expiry:** `1h` (configurable via `JWT_ACCESS_EXPIRY`).  
**Refresh token:** `7d`, delivered as an `httpOnly` cookie on login/register/refresh (`path: /auth`).

**Seeded test password (all demo users):** `Password123!`

---

## POST /auth/register

**Auth:** Public  
**Purpose:** Customer self-registration. Role is always locked to `customer`.  
**Request:** `{ "name": string, "email": string, "password": string }`  
**Response:** `201` — `{ accessToken, expiresIn, user }`. Sets refresh cookie.  
**Error Responses:** `400` validation; `409` email exists.

---

## POST /auth/login

**Auth:** Public  
**Request:** `{ "email": string, "password": string }`  
**Response:** `200` — `{ accessToken, expiresIn, user }`. Sets refresh cookie.  
**Error Responses:** `400`; `401`; `403` deactivated account.

---

## POST /auth/refresh

**Auth:** Refresh cookie  
**Response:** `200` — `{ accessToken, expiresIn, user }`. Rotates refresh cookie.

---

## POST /auth/logout

**Response:** `200` — `{ "message": "Logged out successfully." }`

---

## GET /auth/me

**Auth:** Bearer token  
**Response:** `200` — `{ "user": { id, name, email, role, isActive, permissions } }`

---

## PATCH /auth/profile

**Auth:** Bearer token  
**Request:** `{ "name": string }`  
**Response:** `200` — `{ "user": { ... } }`

---

## PATCH /auth/email

**Auth:** Bearer token  
**Request:** `{ "email": string, "currentPassword": string }`  
**Response:** `200` — `{ "user": { ... } }`  
**Error Responses:** `400`; `401` incorrect password; `409` email exists.

---

## PATCH /auth/password

**Auth:** Bearer token  
**Request:** `{ "currentPassword": string, "newPassword": string }` (min 8 chars)  
**Response:** `200` — `{ "message": "Password updated successfully." }`  
**Error Responses:** `400`; `401` incorrect password.

---

## GET /admin/representatives

**Auth:** Admin only  
**Purpose:** List representatives for management or assignee dropdowns.  
**Query:** `activeOnly=true` — returns only active reps with minimal fields (`id`, `name`, `email`) for assign dropdowns.  
**Response (management, no query):** `200` — includes `assignedTicketCount` per rep.  
**Response (`activeOnly=true`):** `200` — `{ "representatives": [{ "id", "name", "email" }] }` (no counts/permissions).

```json
{
  "representatives": [
    {
      "id": 2,
      "name": "Bob Representative",
      "email": "bob@example.com",
      "role": "representative",
      "isActive": true,
      "permissions": { "canComment": true, ... },
      "assignedTicketCount": 3
    }
  ]
}
```

---

## GET /admin/customers

**Auth:** Admin only  
**Purpose:** List active customers (for admin ticket creation).  
**Response:** `200` — `{ "customers": [{ id, name, email }] }`

---

## POST /admin/representatives

**Auth:** Admin only  
**Request:** `{ name, email, password, permissions? }`  
**Response:** `201` — `{ "user": { ... } }`  
**Error Responses:** `400`; `403`; `409` email exists.

---

## PATCH /admin/representatives/:id/permissions

**Auth:** Admin only  
**Request:** `{ "permissions"?: object, "isActive"?: boolean }`  
**Response:** `200` — `{ "user": { ... } }`  
**Notes:** Soft-deactivate via `isActive: false`; historical ticket assignments preserved.

---

## GET /admin/dashboard-stats

**Auth:** Admin only  
**Purpose:** Aggregated metrics for the admin dashboard (single response).  
**Response:** `200`

```json
{
  "openTickets": { "total": 12 },
  "activeUsers": {
    "total": 7,
    "byRole": { "admin": 1, "representative": 2, "customer": 4 }
  },
  "avgResolution": {
    "windowDays": 30,
    "avgMs": 86400000,
    "resolvedCount": 5
  }
}
```

**Notes:** `avgResolution.avgMs` is `null` when no tickets resolved in the window. Resolution time uses `resolvedAt - createdAt` (see Ticket model).

---

## GET /admin/default-permissions

**Auth:** Admin only  
**Purpose:** View the default permission template applied when creating representatives.  
**Response:** `200` — `{ "template": { canCreateTickets: false, ... }, "description": string }`

---

## GET /dashboard/stats

**Auth:** Bearer token (all roles)  
**Purpose:** Role-scoped dashboard metrics in one response.

**Representative response:**

```json
{
  "role": "representative",
  "stats": {
    "openAssignedTickets": 3,
    "avgResolution": { "windowDays": 30, "avgMs": 43200000, "resolvedCount": 2 }
  }
}
```

**Customer response:**

```json
{
  "role": "customer",
  "stats": {
    "ticketsByStatus": { "open": 1, "in_progress": 0, "resolved": 2, "closed": 1, "cancelled": 0 },
    "totalTickets": 4
  }
}
```

**Notes:** Representative stats are scoped to tickets `assignedTo` the logged-in user. Customer stats are scoped to `createdBy` the logged-in user. Admins should use `GET /admin/dashboard-stats` (not this endpoint) for org-wide metrics.

---

## POST /tickets

**Auth:** Customer or Admin  
**Permission:** `canCreateTickets`
**Request:**

```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "priority": "low|medium|high|critical (optional, default medium)",
  "createdBy": "integer (admin only — customer user id)",
  "assignedTo": "integer (admin, or rep with canAssignTickets via update — optional on create for admin)"
}
```

**Notes:**
- **Customer:** `createdBy` set from JWT automatically; `assignedTo` ignored if sent.
- **Admin:** may pass `createdBy` (customer id) and `assignedTo` (representative id).

**Response:** `201` — created ticket object (flat Sequelize JSON; may not include nested `creator`/`assignee` until refetched).  
**Error Responses:** `400` validation; `403` permission/role.

---

## GET /tickets

**Auth:** Required  
**Query parameters:**

| Param | Description |
|-------|-------------|
| `search` | Keyword search in title and description |
| `status` | Comma-separated statuses (e.g. `open,in_progress`) |
| `priority` | Comma-separated priorities |
| `assignedTo` | Representative id, or `unassigned` (**Admin only**) |
| `sortBy` | `id`, `title`, `priority`, `status`, `createdAt`, `updatedAt` |
| `sortOrder` | `asc` or `desc` |
| `page` | Page number (default 1) |
| `limit` | Page size (default 20, max 100) |

**Access rules (server-enforced in `buildTicketListFilter`):**

| Role | Filter applied |
|------|----------------|
| Customer | `createdBy = userId` — **cannot see other customers' tickets** |
| Representative | `assignedTo = userId` unless `canViewAllTickets` |
| Admin | No filter (all tickets) |

**Response:** `200`

```json
{
  "tickets": [ { "id", "title", "status", "priority", "creator", "assignee", ... } ],
  "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

---

## GET /tickets/assignees

**Auth:** Admin, or Representative with `canAssignTickets`  
**Purpose:** Active representatives for assign dropdowns.  
**Response:** `200` — `{ "representatives": [{ id, name, email }] }`  
**Notes:** Only `isActive: true` representatives returned.

---

## GET /tickets/:id

**Auth:** Required  
**Access:** `assertTicketAccess` — Customer gets 403 on other customers' tickets.  
**Response:** `200` — ticket with nested `comments` and `creator`/`assignee`.  
**Notes:** Inactive assignees still appear on historical tickets.

---

## PUT /tickets/:id

**Auth:** Admin or Representative only (**Customers receive 403**)  
**Request:** `{ "title"?, "description"?, "priority"?, "assignedTo"? }` — `assignedTo` requires admin or `canAssignTickets`  
**Response:** `200` — updated ticket object  
**Error Responses:** `400` if `status` sent in body (must use PATCH status endpoint); `403` permission; `404` not found

## PATCH /tickets/:id/status

**Auth:** Admin or Representative  
**Permission:** `canChangeStatus` (**Customers cannot call this endpoint**)  
**Request:** `{ "status": string }`  
**Validation:** State machine enforced — invalid transitions return `400`.  
**Side effects:** When transitioning **into** `resolved`, `resolvedAt` is set to the current timestamp. Leaving `resolved` clears `resolvedAt`.  
**Allowed transitions:**

| From | To |
|------|-----|
| `open` | `in_progress`, `cancelled` |
| `in_progress` | `resolved`, `open`, `cancelled` |
| `resolved` | `closed`, `in_progress` |
| `closed` | (terminal) |
| `cancelled` | (terminal) |

---

## POST /tickets/:id/comments

**Auth:** Required  
**Permission:** `canComment`  
**Request:** `{ "message": string }`  
**Notes:** User must have ticket access. Customer can comment on own tickets only (enforced by access check).  
**Response:** `201` — comment with `author`.

---

## GET /tickets/:id/comments

**Auth:** Required (same access as ticket)  
**Response:** `200` — array of comments.

---

## GET /health

**Auth:** Public  
**Response:** `200` — `{ "status": "ok" }`

---

## Customer portal data boundaries

The customer portal relies on backend enforcement, not UI hiding:

1. `GET /tickets` returns only the authenticated customer's tickets.
2. `GET /tickets/:id` returns 403 for tickets not created by the customer.
3. `PATCH /tickets/:id/status` and `PUT /tickets/:id` are role-gated to Admin/Representative.
4. `/admin/*` routes require Admin role.
5. Assignee dropdowns (`/tickets/assignees`, `/admin/representatives?activeOnly=true`) are not exposed to customers.

---

## Standard error messages

| Status | Example `error` message |
|--------|-------------------------|
| `401` | `Authentication required. Provide a valid Bearer token.` |
| `403` | `You do not have permission to access this ticket` |
| `403` | `Customers cannot change ticket status.` |
| `400` | `Cannot transition from "open" to "closed".` |

Password hashes are never included in any response.
