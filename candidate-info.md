# Candidate Information

## Name

Ashish Yadav

## Role

Full-stack developer (assessment submission)

## Primary Technology Stack

Node.js, Express, React, Vite, Sequelize, Microsoft SQL Server

## Primary AI Tool Used

Cursor

## Project Option Selected

Support Ticket Management System

## Assessment Start Date

2026-07-18

## Submission Date

2026-07-21

## Project Summary

Built a full-stack support ticket platform with JWT authentication, role-based access control (admin, representative, customer), ticket CRUD with enforced status state machine, comments, keyword search and status filtering (admin/rep and customer UIs), image attachments, and role-specific React UIs. Backend test suite (85 tests across 11 suites) covers auth, RBAC, CRUD, attachments, state transitions, admin management, dashboards, and ticket auto-assignment.

## Tools Used

- **IDE:** Cursor
- **AI:** Cursor Agent for scaffolding, implementation, debugging, tests, and documentation
- **Runtime:** Node.js 22, npm
- **Database:** SQL Server (local) via Sequelize + tedious
- **Testing:** Jest + Supertest

## Setup Summary

1. `npm run install:all` from `ai-practical-assessment/`
2. Copy `src/backend/.env.example` → `src/backend/.env` and configure MSSQL credentials
3. `npm run db:migrate` && `npm run db:seed`
4. `npm run dev` — frontend :5173, backend :3001
5. `npm test` — 85 tests (11 suites) against seeded database

See `README.md` and `database/setup-notes.md` for details.
