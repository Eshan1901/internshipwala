# Architectural Decisions

This document records all architectural decisions made during the InternshipWala backend development.
It must be updated whenever a decision deviates from the original project documentation.

---

## Decision 001 — JavaScript Instead of TypeScript

**Date:** 2026-07-02
**Status:** Approved

**Context:**
The original Backend Architecture & AI Implementation Specification (v1.0) specified TypeScript
as the implementation language.

**Decision:**
The project will be implemented in JavaScript using ES Modules (`"type": "module"` in package.json).
Node.js 18+ runs ES Module JavaScript natively without a compile step.

**Consequences:**
- No `tsconfig.json`, no `.ts` files, no TypeScript compiler.
- No `@types/*` packages required.
- TypeScript interfaces are replaced by JavaScript base classes with `throw new Error('Not implemented')` methods. These serve as the repository contract boundary between the application layer and the database layer.
- JSDoc comments are used throughout for documentation and IDE autocomplete.
- All imports use the `.js` file extension as required by the ES Module specification.
- No build step — `node server.js` runs the source directly in both development and production.

**Approved by:** Project team

---

## Decision 002 — Split Responsibility: Application Layer vs. Database Layer

**Date:** 2026-07-02
**Status:** Approved

**Context:**
The backend is being developed by a team with divided responsibilities.

**Decision:**
- Application layer (routes, middleware, controllers, services, repository interfaces): owned by one developer.
- Database layer (Prisma schema, Prisma client, migrations, seed data, repository implementations): owned by a separate developer.

**Consequences:**
- The application layer never imports Prisma directly.
- Every service depends on a repository interface (base class), not a concrete implementation.
- Repository implementations are injected at the route level when the database developer delivers them.
- The `prisma/` directory is entirely off-limits to the application developer.

**Approved by:** Project team

---
