# Debugging Notes

## Issue

Refresh token cookie not sent on `POST /auth/refresh` from the Vite frontend.

## Problem

Login succeeds and returns an access token, but refresh returns `401 Refresh token not found` when called from `http://localhost:5173`.

## Investigation

- Refresh token is set with `httpOnly: true` and `path: '/auth'`.
- Browser only sends cookies when `credentials: 'include'` is set on fetch/axios.
- CORS must allow credentials: backend needs `cors({ origin: FRONTEND_URL, credentials: true })`.
- Cookie `path: '/auth'` means the cookie is only sent to URLs under `/auth/*` — correct for refresh endpoint.

## Fix

1. Backend: `cookie-parser` middleware + CORS `credentials: true` (see `app.js`).
2. Frontend (when wired): `fetch('/auth/refresh', { method: 'POST', credentials: 'include' })`.
3. Vite proxy must forward cookies — `/auth`, `/admin`, `/tickets`, `/dashboard` in `vite.config.js`. Use `spaHtmlBypass` on paths that overlap with frontend routes so browser refreshes serve `index.html` instead of hitting the API (see issue below).

---

## Issue

`authenticate` middleware must load the User from DB, not trust JWT alone.

## Problem

JWT may be valid but user could be deactivated after token was issued.

## Investigation

Access token contains `userId`, `role`, `permissions` but `isActive` can change server-side.

## Fix

`authenticate` loads `User.findByPk(payload.userId)` and checks `isActive` before attaching `req.user`. Returns `403` for deactivated accounts.

---

## Issue

Sequelize `User.scope('withPassword')` required for login.

## Problem

Default scope excludes `passwordHash`; login could not compare passwords.

## Fix

Login uses `User.scope('withPassword').findOne({ where: { email } })`. Password hash is never returned in API responses — only used for `bcrypt.compare`.

---

## Issue

Ticket list filter must be applied in SQL, not post-query.

## Problem

Customers could see other users' tickets if filtering happened only in the UI.

## Fix

`buildTicketListFilter(req.user)` adds `createdBy: userId` (customers) or `assignedTo: userId` (reps without `canViewAllTickets`) directly to the Sequelize `where` clause in `getTickets`.

---

## Issue

401 responses from expired access tokens left the UI broken with no recovery path.

## Problem

- `apiFetch` threw on 401 but only called `clearSession` with no user feedback or redirect.
- No silent refresh / retry — users were logged out abruptly on the first expired token.
- Concurrent 401s could trigger multiple refresh attempts.

## Fix

Centralized in `src/frontend/src/api/client.js` + `AuthSessionBridge.jsx`:

### Retry once, don't loop forever

1. **`/auth/*` endpoints are excluded** from the refresh-and-retry path (`AUTH_PATHS_NO_REFRESH`). Login/register/refresh/logout 401s fail immediately.
2. **`refreshAccessTokenRequest()` uses raw `fetch`**, not `apiFetch`, so a failed refresh cannot re-enter the interceptor.
3. **Each request retries at most once** via an `_isAuthRetry` flag. If the retried request still returns 401, session expiry is handled and the error is thrown — no second refresh attempt.
4. **Concurrent 401s share one in-flight refresh** (`refreshPromise` singleton). Ten parallel API calls → one `POST /auth/refresh`, then all retry with the new token.

```
Request → 401?
  ├─ auth path or already _isAuthRetry → throw
  ├─ attempt refresh (deduped)
  │    ├─ success → retry request once (_isAuthRetry: true)
  │    │    ├─ 200 → return data
  │    │    └─ 401 → session expired handler → throw
  │    └─ fail → session expired handler → throw
  └─ not 401 → throw
```

### Session expired UX

`AuthSessionBridge` registers `setSessionExpiredHandler`:
- Clears auth state
- Toast: "Your session has expired, please log in again"
- Redirects to `/login` with `state.from` = current path + query string

`LoginPage` reads `state.from` and sends the user back after login.

### Proactive warning

`AuthSessionBridge` decodes the JWT `exp` claim (~90s before expiry):
- Shows info toast: "Your session is expiring soon — refreshing in the background."
- Calls `performRefresh()` proactively

### Route guards (no token)

`ProtectedRoute` / `PermissionRoute` check `isInitializing` then `isAuthenticated` **before** any page API calls. Unauthenticated users hit `/login` immediately with `state.from` preserved — not via a failed API 401.

---

## Issue

Browser refresh on frontend routes shows raw JSON: `{"error":"Authentication required. Provide a valid Bearer token."}`

## Problem

Refreshing the page on routes like `/tickets`, `/admin/dashboard`, or `/admin/users` displayed the API 401 response as the entire page — not the React app, and not the login screen.

## Investigation

- The error text comes from `authenticate` middleware — a **GET** request hit a protected API route without a Bearer token.
- On refresh, the browser requests the current URL with `Accept: text/html`.
- Vite's dev proxy forwards `/tickets`, `/admin`, and `/dashboard` to `http://localhost:3001`.
- Those prefixes overlap with **frontend** React Router paths, so the navigation was proxied to Express instead of serving `index.html`.
- Example: refresh on `/tickets` → proxy → `GET /tickets` on backend → 401 JSON (not an SPA load).
- This is **not** a broken refresh-token flow — `AuthProvider` bootstrap never ran because the SPA never loaded.

## Fix

Added `spaHtmlBypass` in `src/frontend/vite.config.js`:

```js
function spaHtmlBypass(req) {
  const accept = req.headers.accept || '';
  if (accept.includes('text/html')) {
    return '/index.html';
  }
}
```

Applied to `/tickets`, `/admin`, and `/dashboard` proxy entries. `/auth` is unchanged (API-only paths, no SPA route conflict).

- **Browser navigation** (`Accept: text/html`) → Vite serves `index.html` → React boots → `AuthProvider` calls `POST /auth/refresh` with the httpOnly cookie → session restored.
- **API calls** from `fetch` (`Accept: */*`) → still proxied to the backend as before.

**Note:** Restart the Vite dev server after changing `vite.config.js` — hot reload does not pick up proxy config changes.

