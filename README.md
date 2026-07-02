# InternshipWala Backend

> **Platform:** https://www.internshipwala.com
> **Company:** Cloudtechz InternshipWALA Private Limited
> **Type:** REST API Backend
> **Stack:** Node.js 18+ · Express.js · PostgreSQL (Neon) · Prisma ORM · JWT · bcrypt · Multer · Winston
> **Language:** JavaScript (ES Modules)
> **Deployment Target:** Render / Railway

---

## Overview

REST API backend for InternshipWala Careers — India's leading online internship training platform.
Manages student registration, course enrollment, payment verification, learning progression,
certificate issuance, admin content management, and notifications.

---

## Architecture

```
Request → Route → Middleware → Controller → Service → Repository Interface → Database
```

- **Controllers** — HTTP boundary only. No business logic.
- **Services** — All business rules and orchestration.
- **Repository Interfaces** — Contracts defining data access methods. Implemented by the database developer using Prisma.
- **Middlewares** — Auth guards, validation, rate limiting, security headers.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Language | JavaScript (ES Modules) |
| Database | PostgreSQL (Neon) |
| ORM | Prisma (database developer responsibility) |
| Authentication | JWT — separate secrets for students and admins |
| Password Hashing | bcrypt (cost factor 12) |
| Validation | Zod |
| File Uploads | Multer (local disk storage) |
| Email | Nodemailer (SMTP) |
| Logging | Winston |
| Scheduled Jobs | node-cron |
| Security | Helmet, CORS, xss-clean, hpp, express-rate-limit |

---

## Team Responsibility Split

| Layer | Owner |
|-------|-------|
| Routes, Middleware, Controllers, Services, Repository Interfaces | Application Developer |
| Prisma Schema, Migrations, Seed Data, Repository Implementations | Database Developer |

The application layer never imports Prisma directly.
Every service depends on a repository interface (JavaScript base class contract).
The database developer provides concrete implementations.

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env
# → Fill in all required values in .env before starting
```

### Development

```bash
npm run dev
```

The server starts with hot reload via nodemon. Default port: `3000`.

### Production

```bash
npm start
```

No build step required — Node.js runs the JavaScript source directly.

---

## Environment Variables

All required variables are listed in `.env.example`. Copy it to `.env` and fill in values.
The application will refuse to start if required variables are missing (validated by Zod on startup).

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | HTTP server port (default: 3000) |
| `ALLOWED_ORIGINS` | Comma-separated frontend origins for CORS |
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `STUDENT_JWT_SECRET` | JWT secret for student tokens (min 32 chars) |
| `ADMIN_JWT_SECRET` | JWT secret for admin tokens (min 32 chars) |
| `STUDENT_JWT_EXPIRY` | Student token expiry (e.g. `7d`) |
| `ADMIN_JWT_EXPIRY` | Admin token expiry (e.g. `24h`) |
| `OTP_EXPIRY_MINUTES` | OTP validity window in minutes (default: 15) |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `MAIL_FROM` | From address for outgoing emails |
| `UPLOAD_DIR` | Local upload directory (default: `uploads`) |
| `MAX_PROFILE_PHOTO_SIZE_MB` | Max profile photo size in MB |
| `MAX_PROJECT_FILE_SIZE_MB` | Max project/assignment file size in MB |

See `.env.example` for the complete list with descriptions.

---

## Project Structure

```
internshipwala-backend/
│
├── prisma/                        # Database developer responsibility — do not modify
│
├── src/
│   ├── config/                    # Environment loader, JWT helpers, mailer, upload config
│   ├── constants/                 # Role names, permission names, enums, message strings
│   ├── middlewares/               # Auth guards, validation runner, rate limiter, error handler
│   ├── validators/                # Zod schemas for every request shape
│   ├── repositories/
│   │   └── interfaces/            # Repository contracts (base classes)
│   ├── services/                  # All business logic (one file per domain)
│   ├── controllers/               # HTTP handlers (one file per domain)
│   ├── routes/
│   │   └── admin/                 # Admin route files
│   ├── jobs/                      # node-cron scheduled tasks
│   ├── logger/                    # Winston logger configuration
│   └── app.js                     # Express app factory
│
├── uploads/                       # Runtime file storage — gitignored content
│   ├── profiles/
│   ├── projects/
│   ├── assignments/
│   └── certificates/
│
├── logs/                          # Winston log files — gitignored content
│
├── .env.example                   # Environment variables template
├── .eslintrc.json                 # ESLint configuration
├── .prettierrc                    # Prettier configuration
├── .gitignore
├── DECISIONS.md                   # Architectural decisions log
├── AI_INSTRUCTIONS.md             # AI coding assistant instructions
├── IMPLEMENTATION_ORDER.md        # Implementation phase plan
├── PROGRESS.md                    # Implementation progress tracker
├── package.json
└── server.js                      # Entry point — starts the HTTP server
```

---

## Implemented Endpoints

### Authentication (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | None | Student registration — sends OTP |
| POST | `/api/auth/verify-otp` | None | Verify OTP, activate account |
| POST | `/api/auth/resend-otp` | None | Resend OTP |
| POST | `/api/auth/login` | None | Student login |
| POST | `/api/auth/admin/login` | None | Admin login |
| POST | `/api/auth/forgot-password` | None | Initiate password reset |
| POST | `/api/auth/reset-password` | None | Complete password reset |
| PUT | `/api/auth/change-password` | Student JWT | Change password |

### User Profile (`/api/user`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/user/profile` | Student JWT | Get own profile |
| PUT | `/api/user/profile` | Student JWT | Update profile fields |
| POST | `/api/user/profile/photo` | Student JWT | Upload profile photo |

### Admin (`/api/admin`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/me` | Admin JWT | Get own admin profile |
| GET | `/api/admin/admins` | Admin JWT | List all admins |
| POST | `/api/admin/admins` | Admin JWT + super_admin | Create admin |
| PUT | `/api/admin/admins/:id` | Admin JWT + super_admin | Update admin |
| DELETE | `/api/admin/admins/:id` | Admin JWT + super_admin | Deactivate admin |
| POST | `/api/admin/admins/:id/roles` | Admin JWT + super_admin | Assign role |
| DELETE | `/api/admin/admins/:id/roles/:roleId` | Admin JWT + super_admin | Remove role |
| GET | `/api/admin/activity-logs` | Admin JWT + permission | View audit logs |

---

## API Overview

### Base URL

```
Production:  https://api.internshipwala.com/api
Development: http://localhost:3000/api
```

### Authentication

All protected endpoints require a Bearer token:

```
Authorization: Bearer <jwt_token>
```

Student tokens: `POST /api/auth/login`
Admin tokens: `POST /api/auth/admin/login`

### Response Format

All responses follow a consistent shape:

**Success:**
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { }
}
```

**Paginated success:**
```json
{
  "success": true,
  "message": "...",
  "data": [ ],
  "meta": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [ { "field": "email", "message": "Invalid email format" } ]
}
```

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `nodemon server.js` | Development with hot reload |
| `npm start` | `node server.js` | Production start |
| `npm run lint` | `eslint . --ext .js` | Run ESLint |
| `npm run format` | `prettier --write .` | Format all files |

---

## Implementation Progress

| Phase | Status |
|-------|--------|
| Phase 1 — Project Foundation | ✅ Complete |
| Phase 2 — Core Infrastructure | ✅ Complete |
| Phase 3 — Security & Middleware | ✅ Complete |
| Phase 4 — Validation Layer | ✅ Complete |
| Phase 5 — Repository Interfaces | ✅ Complete |
| Phase 6 — Authentication Module | ✅ Complete |
| Phase 7 — Admin & RBAC | ✅ Complete |
| Phase 8 — User Profile Module | ✅ Complete |
| Phase 9 onwards | 🔄 In Progress |

See `PROGRESS.md` for the full task-level breakdown.

---

## Contact

**InternshipWala Careers**
Email: career.internshipwala@gmail.com
Website: https://www.internshipwala.com

*Company: Cloudtechz InternshipWALA Private Limited*
