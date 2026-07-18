# Requirements Analysis

> **Note:** Sections below with `<!-- ... -->` placeholders are for the candidate to complete. Factual scope additions from the build are documented at the end without rewriting the original exercise brief.

## Selected Project Option

<!-- Support Ticket Management System. -->

## My Understanding

<!-- Your interpretation of the exercise requirements. -->

## Functional Requirements

<!-- List functional requirements you identified at the start of the exercise. -->

### Original Core scope (as scaffolded)

The initial exercise scaffold targeted:

- Ticket CRUD (create, list, detail, update fields)
- Comments on tickets
- Status field on tickets (business rules initially stubbed as TODOs)
- Basic React UI (list, detail, create pages)
- Sequelize models for User, Ticket, Comment
- MSSQL database with migrations and seed data

### Implemented beyond original Core (factual — added during exercise)

These were **not** in the original stub/TODO-only Core but are now built:

| Area | What was added |
|------|----------------|
| **Authentication** | JWT access + httpOnly refresh cookies; register/login/logout/refresh; profile/email/password settings |
| **RBAC** | Roles (`admin`, `representative`, `customer`); `permissions` JSON on users; `isActive`; middleware (`authenticate`, `authorize`, `checkPermission`) |
| **Admin APIs** | Representative management, customer list, dashboard stats, default permission template |
| **Ticket list (internal)** | Paginated/filtered/sorted list; URL-synced filters; slide-panel detail; state machine for status transitions |
| **Customer portal** | Role-specific dashboard, status stepper, conversation UI, create modal/FAB |
| **Representative management UI** | Admin table, permission editor, active toggle |
| **Dashboard stats** | Admin/rep/customer metrics; `resolvedAt` column for resolution time |
| **Settings page** | Profile, email, password, theme preference, admin permission template (view-only) |
| **UX polish** | Global loading bar, debounced search, dark mode, breadcrumbs |

## Non-Functional Requirements

<!-- Performance, security, maintainability, etc. -->

## Assumptions

<!-- Assumptions made when requirements were ambiguous. -->

## Clarifications

<!-- Questions asked and answers received (or assumed). -->

## Edge Cases

<!-- Edge cases identified during analysis. -->
