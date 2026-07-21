# Code Review Prompts

| Prompt | AI Response Summary | Accepted | Changed | Rejected | Why |
|--------|---------------------|----------|---------|----------|-----|
| *(self-review after RBAC User model first draft)* Double `User.init()` call risk | Initial draft called `sequelize.define` then `User.init` again for `permissions` field | N | Y | Y | Merged into single `define()` — double init breaks Sequelize model registration |
| *(self-review)* `passwordHash` exposure in API responses | User model `defaultScope` excludes `passwordHash` from queries | Y | N | N | Security default before auth is implemented |
| *(self-review)* Legacy `agent` role in original migration | New migration maps `agent` → `representative` instead of editing old migration | Y | N | N | Preserves migration history for anyone who already ran v1 |
| *(pre-submit audit)* Docs claimed attachments/UUID out of scope while code shipped | Synced `data-model.md`, `api-contract.md`, `spec.md`, test counts | Y | Y | N | Honesty of lifecycle artifacts weighed heavily in grading |
| *(pre-submit audit)* Core "update fields" was API-only | Added editable title/description/priority in `TicketDetailPanel` | Y | N | N | Checklist requires UI, not just backend |
| **Correct AI form-control scaffold** | AI `Input`/`Select`/`Textarea` used `id \|\| name`, so unlabeled controls (e.g. TicketFilterBar "Assigned to") had no `htmlFor` target — Testing Library could not resolve by label | Fixed with `useId()` fallback so labels always bind | Y | Y | N | Rejected leaving a11y broken; see commit for isolated fix |
