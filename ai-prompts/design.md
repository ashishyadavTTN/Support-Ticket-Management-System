# Design Prompts

| Prompt | AI Response Summary | Accepted | Changed | Rejected | Why |
|--------|---------------------|----------|---------|----------|-----|
| Design repo structure for AI capability exercise: FE/BE split, `database/migrations`, `tests/`, `ai-prompts/`, `tool-specific/cursor-workflow/` | Flat assessment docs at root, app code under `src/`, Sequelize migrations at `database/migrations`, integration tests at repo `tests/` | Y | N | N | Followed prescribed structure exactly |
| RBAC: add `permissions` as JSON vs separate Permission join table — pick cleaner Sequelize approach | Chose JSON column on `Users` for fixed boolean flags; Representatives store overrides, Admin uses `null` + role defaults, Customer gets restrictive defaults via `resolvePermissions()` | Y | N | N | Avoids extra joins for data always read with user; easy seeding for two rep personas |
| RBAC: ensure `createdBy` → Customer, `assignedTo` → Representative or null | `Ticket.beforeValidate` hooks + model comments; seed data distributes tickets across three customers | Y | N | N | Enforces integrity at data layer before auth middleware exists |
| Add `canViewAllTickets` permission for Representative visibility scope | Included in permissions JSON alongside four requested flags; Bob (assigned-only) vs Diana (view-all + assign) in seed | Y | N | N | Required to test "assigned vs all tickets" without auth |
| JWT access token payload: userId, role, permissions; refresh token in httpOnly cookie | Separate secrets, `type: 'access'|'refresh'` claim; cookie `path: '/auth'`, rotated on refresh | Y | N | N | Keeps long-lived token out of localStorage |
| Server-side ticket scoping: customers filter `createdBy`, reps filter `assignedTo` unless `canViewAllTickets` | `buildTicketListFilter()` + `assertTicketAccess()` in controller, not UI-only | Y | N | N | Security requirement — enforced in Sequelize `where` clause |
