# Final AI Usage Summary

## Overview

AI (Cursor) was used across the entire project lifecycle: scaffolding, design decisions, backend/frontend implementation, debugging, integration tests, and documentation. Human judgment focused on security boundaries, scope control, and validating AI output against the exercise rubric.

## Prompt Categories

| Category | File | Approx. prompts logged | Primary use |
|----------|------|------------------------|-------------|
| Planning | `ai-prompts/planning.md` | 3 | Scaffold structure, RBAC plan, auth design |
| Design | `ai-prompts/design.md` | 6 | Schema, permissions model, JWT, ticket scoping |
| Implementation | `ai-prompts/implementation.md` | 11 | Backend, frontend, auth, Vite proxy fix |
| Testing | `ai-prompts/testing.md` | 6 | Jest setup, suite implementation, audit gaps |
| Debugging | `ai-prompts/debugging.md` | 5 | Sequelize CLI, MSSQL connection, SPA refresh |
| Code review | `ai-prompts/code-review.md` | 3 | Model init, password scope, migration strategy |
| Documentation | `ai-prompts/documentation.md` | 6 | API contract, data model, debugging notes |

## Acceptance Rate

Estimated from prompt log tables (not every session was logged):

| Outcome | Approx. share | Examples |
|---------|---------------|----------|
| **Accepted as-is** | ~70% | Scaffold structure, JWT cookie design, Tailwind component patterns |
| **Changed before merge** | ~25% | Permissions JSON parsing, Vite proxy bypass, seed persona distribution |
| **Rejected** | ~5% | Double `User.init()`, UI-only access control suggestions |

## Key Learnings

1. **Persistent context files pay off** — `project-context.md` reduced repeated stack explanations
2. **Log rejections, not just accepts** — shows judgment; the double-`User.init()` rejection is good evidence
3. **Validate security suggestions manually** — AI proposed patterns that looked correct but missed MSSQL JSON string behavior
4. **Keep docs in sync with code** — stale `acceptance-criteria.md` would have hurt grading more than missing a stretch feature
5. **Integration tests are the best AI validation loop** — `npm test` catches regressions from accepted AI diffs quickly

## Recommendations

For future AI capability exercises:

1. Commit after each milestone so prompt history maps to git history
2. Fill `tool-workflow.md` as you go, not at the end
3. Replace `it.todo` with real tests before adding stretch features
4. Include at least one prompt log entry showing **correction of wrong AI output**
5. Run a final doc audit against `npm test` output before submitting
