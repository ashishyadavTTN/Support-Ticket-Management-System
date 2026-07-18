# Implementation Plan

> **Note:** The sections below with placeholders are for your original plan. A factual **Actual vs Planned** summary is at the end based on what was built.

## Overview

<!-- High-level implementation approach you intended at the start. -->

## Task Breakdown

<!-- Ordered list of tasks and subtasks from your original plan. -->

## Milestones

<!-- Key milestones and target dates. -->

## AI Usage Plan

<!-- Where you planned to use AI during implementation. -->

## Risks

<!-- Technical and schedule risks you identified upfront. -->

## Mitigation

<!-- How you planned to mitigate identified risks. -->

---

## Actual vs Planned

This section records how the build **diverged** from the original Core scaffold without replacing your original plan above.

### Original Core scaffold (planned / stubbed)

| Planned item | Original state |
|--------------|----------------|
| Ticket CRUD API | Routes/controllers present; status machine and validation were TODOs |
| Comments | Basic create/list endpoints |
| React UI | List, detail, new ticket pages with plain CSS |
| Auth | Not in scope — `passwordHash` column reserved |
| RBAC | Role enum only; no permission enforcement |
| Tests | Placeholder integration test file |

### What was actually built (additions & completions)

| Phase | Delivered |
|-------|-----------|
| **Data layer** | RBAC migration (`passwordHash`, `isActive`, `permissions`); `resolvedAt` on tickets |
| **Auth** | Full JWT flow; `authenticate` / `authorize` / `checkPermission` middleware; protected routes |
| **Ticket API** | Pagination, search, multi-filter, sort; state machine; role-scoped list/detail access |
| **Admin API** | Representatives CRUD-ish (create, list, patch permissions/active); customers list; dashboard stats |
| **Settings API** | Profile, email, password update endpoints |
| **Frontend foundation** | Tailwind design system; shared UI components; AuthContext; route guards; app shell |
| **Role UIs** | Admin/rep ticket table; customer portal; rep management; dashboards; settings |
| **UX polish** | Loading bar, debounced search, dark mode, breadcrumbs |
| **Docs** | `api-contract.md`, `data-model.md`, `ui-flow.md`, `design-notes.md` updated incrementally |

### Still incomplete vs a production system

- Status transition integration tests (todos in test file)
- No auth/RBAC integration test suite
- No frontend test runner
- Admin default permission template is view-only (editing deferred)
- Admin dashboard has no "trend" metrics (e.g. +N since yesterday)

<!-- Add your own timeline notes, blockers, and retrospective here. -->
