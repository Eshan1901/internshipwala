

# AI Instructions

## Project Overview

You are working on the InternshipWala Backend project.

This project is a complete backend rewrite of the InternshipWala platform. The objective is to build a production-ready, scalable, maintainable REST API that exactly matches the provided documentation.

This project follows a documentation-first development approach.

The documentation inside the `docs` directory is the single source of truth.

Never replace documented requirements with assumptions.

---

# Project Goal

The goal is to produce a backend that:

- Matches the provided documentation exactly.
- Is production-ready.
- Is clean, modular, and scalable.
- Follows a layered architecture.
- Can later connect to PostgreSQL with minimal code changes.
- Is easy for a team of developers to maintain.

---

# Source of Truth

Always use the project documentation.

Priority order:

1. docs/03-database/Database-Design.md
2. docs/02-backend/Backend-Architecture.md
3. docs/02-backend/Backend-README.md
4. docs/01-business/Website-Features.pdf
5. docs/01-business/Admin-User-Modules.pdf

If multiple documents appear to conflict:

Follow the higher priority document.

Never guess.

If information is unclear:

Stop.

Ask for clarification.

---

# Before Starting Any Task

Before writing or modifying code:

1. Read the relevant documentation.
2. Understand the requested feature.
3. Identify affected modules.
4. Identify dependencies.
5. Verify implementation requirements.
6. Explain the implementation plan.
7. Then generate code.

Never immediately generate code without understanding the feature.

---

# Architecture

Always follow this architecture.

Request

↓

Route

↓

Middleware

↓

Controller

↓

Service

↓

Repository

↓

Database

Never skip layers.

Never merge responsibilities.

---

# Layer Responsibilities

## Routes

- Register endpoints.
- Apply middleware.
- Nothing else.

---

## Middleware

Responsible for:

- Authentication
- Authorization
- Validation
- Logging
- Security
- Error forwarding

No business logic.

---

## Controllers

Responsible only for:

- Receiving requests
- Calling services
- Returning responses

Controllers must never:

- Query databases
- Contain business logic
- Perform validations
- Access Prisma directly

---

## Services

Services contain all business logic.

Services:

- Apply business rules.
- Coordinate repositories.
- Call multiple repositories if required.
- Handle workflows.

Services must never:

- Return HTTP responses.
- Read Express request objects.

---

## Repositories

Repositories are responsible only for data access.

Repositories must:

- Expose clean methods.
- Hide implementation details.

Business logic must never exist here.

---

# Repository Strategy

During initial development:

Use mock repositories.

Do not connect PostgreSQL.

Do not generate Prisma schema.

Do not create migrations.

Later, repositories can be replaced with Prisma implementations.

Controllers and services should not require significant modification.

---

# Database Rules

The database document is authoritative.

Never:

- Add tables
- Remove tables
- Rename entities
- Change relationships
- Change constraints

unless explicitly instructed.

---

# Coding Standards

Use:

- TypeScript
- Strict typing
- Interfaces
- Enums
- Async/await

Avoid:

- any
- duplicated code
- magic strings
- deeply nested logic
- oversized files

Keep code modular.

Follow SOLID principles where appropriate.

---

# Naming Conventions

Use descriptive names.

Examples:

UserController

CourseService

EnrollmentRepository

AuthMiddleware

Never use vague names such as:

manager.ts

helper.ts

misc.ts

temp.ts

test1.ts

---

# Validation

Every endpoint must validate:

- Body
- Params
- Query

Validation belongs inside middleware.

Never validate inside controllers.

---

# Error Handling

Use centralized error handling.

Return consistent API responses.

Never expose:

- stack traces
- SQL errors
- internal implementation

Use appropriate HTTP status codes.

---

# Authentication

Implement authentication exactly as documented.

Use JWT.

Separate student and admin authentication if documented.

Never invent authentication flows.

---

# Authorization

Follow documented RBAC.

Never bypass permission checks.

Never hardcode roles.

---

# Security

Always include:

- Helmet
- CORS
- Rate Limiting
- Password Hashing
- JWT Verification
- Input Validation

Never sacrifice security for convenience.

---

# Logging

Log:

- Requests
- Errors
- Important business events

Never log:

- Passwords
- Tokens
- OTPs
- Sensitive personal information

---

# File Uploads

Follow the documented upload strategy.

Never invent storage providers.

Keep upload handling modular.

---

# API Design

Use REST principles.

Use:

GET

POST

PUT

PATCH

DELETE

Use appropriate status codes.

Keep responses consistent.

---

# Documentation

Whenever a module is completed:

Update:

- PROGRESS.md

If an architectural decision changes:

Update:

- DECISIONS.md

---

# Code Quality

Generate production-quality code.

Avoid placeholder implementations.

Avoid TODO comments unless requested.

Avoid dead code.

Avoid unnecessary abstractions.

Write code that another engineer can understand immediately.

---

# Never Do These

Never:

- Skip architecture layers
- Access the database from controllers
- Put business logic inside routes
- Put business logic inside repositories
- Invent endpoints
- Invent request fields
- Invent response fields
- Invent business rules
- Invent enums
- Invent permissions
- Invent database tables
- Rename documented entities
- Change folder structure without approval
- Refactor unrelated modules while implementing another feature

---

# Hallucination Prevention

If documentation does not specify something:

Do not guess.

Do not infer.

Do not create your own implementation.

Instead:

1. Explain what information is missing.
2. Explain why it is required.
3. Ask for clarification.

---

# Project Philosophy

Prioritize:

Documentation over assumptions.

Maintainability over shortcuts.

Readability over clever code.

Consistency over personal preference.

Clean architecture over quick fixes.

Long-term scalability over temporary solutions.

---

# Working Style

Work incrementally.

Never attempt to generate the entire backend at once.

Implement one module at a time.

Before every implementation:

1. Read documentation.
2. Analyze dependencies.
3. Explain the plan.
4. Generate code.
5. Verify compilation.
6. Update project progress.

---

# Definition of Done

A module is considered complete only when:

✓ Routes implemented

✓ Controllers implemented

✓ Services implemented

✓ Repositories implemented

✓ Validation added

✓ Authentication added (if required)

✓ Authorization added (if required)

✓ Error handling implemented

✓ Logging implemented

✓ Documentation updated

✓ PROGRESS.md updated

Only then begin the next module.

---

# Final Instruction

Your primary responsibility is not to generate code quickly.

Your primary responsibility is to generate accurate, maintainable, production-quality code that faithfully follows the project documentation.

If there is uncertainty:

Stop.

Explain the issue.

Ask for clarification.

Never guess.