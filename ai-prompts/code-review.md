# Code Review Prompts

| Prompt | AI Response Summary | Accepted | Changed | Rejected | Why |
|--------|---------------------|----------|---------|----------|-----|
| *(self-review after RBAC User model first draft)* Double `User.init()` call risk | Initial draft called `sequelize.define` then `User.init` again for `permissions` field | N | Y | Y | Merged into single `define()` — double init breaks Sequelize model registration |
| *(self-review)* `passwordHash` exposure in API responses | User model `defaultScope` excludes `passwordHash` from queries | Y | N | N | Security default before auth is implemented |
| *(self-review)* Legacy `agent` role in original migration | New migration maps `agent` → `representative` instead of editing old migration | Y | N | N | Preserves migration history for anyone who already ran v1 |
