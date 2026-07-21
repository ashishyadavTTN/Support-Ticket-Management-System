# UI Flow

## Design System

- **Styling:** Tailwind CSS with custom theme (`tailwind.config.js`)
- **Typography:** Inter (Google Fonts) — display, h1–h3, body, label, caption scales
- **Palette:** Teal brand (`brand-*`), warm stone neutrals (`surface-*`), semantic status/priority colors
- **Dark mode:** `class`-based; `ThemeContext`; toggle in header + settings; no flash on load (`index.html` script)
- **Components:** Button, Badge, Modal, Toast, Input, Select, Textarea, Skeleton, EmptyState, SlidePanel, LoadingBar, SearchInput, Breadcrumbs, ThemeToggle

### Visual tone by role

| Audience | Tone | Key patterns |
|----------|------|--------------|
| Admin / Representative | Internal tool (Linear/Jira-like) | Data tables, slide panels, filter chips, dense layouts |
| Customer | Consumer-friendly portal | Stat cards, rounded cards, FAB on mobile, status stepper, conversational copy |

---

## Pages

### Public (unauthenticated)

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Email/password sign-in; redirects to role dashboard (or `state.from`) |
| Register | `/register` | Customer account creation |

### Admin

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin/dashboard` | Live stats: open tickets, active users, avg resolution (30d) |
| All Tickets | `/tickets` | Full ticket table with filters, debounced search, slide panel, pagination |
| Representatives | `/admin/users` | Manage reps, permissions, active toggle, debounced search |
| Settings | `/admin/settings` | Profile, password, theme, default permission template (view-only) |

### Representative

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/rep/dashboard` | Assigned open tickets + avg resolution (30d) |
| Tickets | `/tickets` | Ticket table (scoped by backend RBAC) |
| Settings | `/rep/settings` | Profile, password, theme |

### Customer portal

| Page | Route | Description |
|------|-------|-------------|
| Home | `/customer/dashboard` | Status summary cards + keyword search + status filter + ticket grid |
| My Requests | `/tickets` | Same portal component as Home |
| Request detail | `/tickets/:id` | Breadcrumbs, status stepper, conversation thread |
| Create (redirect) | `/tickets/new` | Redirects customers to `/customer/dashboard?create=true` |
| Settings | `/customer/settings` | Profile, password, theme |
| Unauthorized | `/unauthorized` | Forbidden route |

---

## Navigation Structure

### Admin sidebar

```
Dashboard        → /admin/dashboard
All Tickets      → /tickets
Users            → /admin/users
Settings         → /admin/settings
```

### Representative sidebar

```
Dashboard        → /rep/dashboard
Tickets          → /tickets
Settings         → /rep/settings
```

### Customer sidebar

```
Home             → /customer/dashboard
My Requests      → /tickets
Settings         → /customer/settings
```

Create ticket (customer): **FAB** (mobile) or **"New request"** button (desktop) — no separate nav item.

---

## Breadcrumbs (nested views)

Role-aware roots in `constants/breadcrumbs.js`:

| View | Admin / Rep trail | Customer trail |
|------|-------------------|----------------|
| Ticket detail | Dashboard → Tickets → `#123` | Home → My Requests → `#123` |
| Rep edit (admin) | Dashboard → Representatives → `{name}` | — |

- Implemented on `InternalTicketDetail`, `CustomerTicketDetail`, and `RepresentativesPage` (when a rep is selected)
- Segments truncate on mobile; last segment is non-clickable

---

## Navigation Flow

### Customer

```
/login or /register
       │
       ▼
/customer/dashboard ──► stat cards + ticket grid
       │                      │
       │ FAB / "New request"  │ click card
       ▼                      ▼
  create modal          /tickets/:id
       │                 (breadcrumbs + stepper + comments)
       └──── after submit ──► detail view
```

### Admin / Representative

```
Role dashboard ──► /tickets (table + slide panel)
       │
       ▼ (admin only)
/admin/users ──► row click opens edit panel + breadcrumb
```

### Settings (all roles)

```
Sidebar → /{role}/settings
  ├── Profile (name, email with password confirm)
  ├── Password change
  └── Preferences (dark mode toggle)
  └── (admin only) Default representative permission template
```

---

## Route Guards

| Guard | Behavior |
|-------|----------|
| `PublicOnlyRoute` | Redirects authenticated users to role dashboard |
| `ProtectedRoute` | Redirects unauthenticated users to `/login` with `state.from` |
| `ProtectedRoute` + `allowedRoles` | Redirects unauthorized roles to `/unauthorized` |
| `PermissionRoute` | Checks granular permission flag (admins bypass) |

---

## Global UX (cross-cutting)

| Feature | Behavior |
|---------|----------|
| **Loading bar** | Thin top bar on any in-flight API request (`api/loadingTracker.js`) |
| **Debounced search** | 400ms on admin/rep ticket list, customer portal, and rep management; inline "Searching…" state |
| **Dark mode** | Header toggle + settings; persisted in `localStorage`; respects `prefers-color-scheme` on first visit |
| **Session handling** | Silent refresh on 401; session-expired toast; proactive expiry warning |

---

## Data isolation (server-enforced)

| Role | `GET /tickets` | `GET /tickets/:id` |
|------|----------------|---------------------|
| Customer | Only `createdBy = userId` | 403 if not own ticket |
| Representative | Assigned only, or all if `canViewAllTickets` | Same rule per ticket |
| Admin | All tickets | All tickets |

Customers cannot call `PUT /tickets/:id`, `PATCH /tickets/:id/status`, or `/admin/*` (403).

---

## Auth State

- Access token in memory (`AuthContext`)
- Refresh token in httpOnly cookie (`credentials: 'include'`)
- Session restored via `POST /auth/refresh` on app load

---

## Responsive Behavior

| Breakpoint | Admin/Rep | Customer |
|------------|-----------|----------|
| ≥ 768px | Sidebar + data table | Sidebar + card grid + header CTA |
| < 768px | Hamburger + card list | Hamburger + card grid + FAB |

---

## User Actions per Page

### Customer Home

- View status summary (Open, In Progress, Resolved, Closed counts from API)
- Keyword search (debounced) and status filter (including Cancelled)
- Browse own tickets (newest first)
- Create request via modal
- Tap ticket card → detail view with breadcrumbs

### Customer Request Detail

- View status stepper; Cancelled shown as distinct terminal state
- Read description, assigned agent, and image attachments
- Read/post comments with optional image attachments (optimistic UI)
- **Cannot** change status or edit ticket fields

### Admin Dashboard

- View open/in-progress ticket count, active user breakdown, avg resolution (30d)

### Admin Ticket List

- Search (debounced), filter by status/priority/assignee, sort, paginate
- Row click → slide panel (edit title/description/priority, status, assignee, comments, attachments)
- New ticket modal (admin can pick customer + assignee; optional images)

### Representatives (Admin)

- Search reps by name/email (client-side debounce)
- Toggle active status, edit permissions in slide panel
- Breadcrumb when editing a specific rep

