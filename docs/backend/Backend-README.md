# InternshipWala Backend

> **Platform:** [https://www.internshipwala.com](https://www.internshipwala.com)
> **Company:** Cloudtechz InternshipWALA Private Limited
> **Type:** REST API Backend
> **Stack:** Node.js · Express.js · PostgreSQL (Neon) · Prisma ORM · JWT · bcrypt · Multer · Winston
> **Deployment Target:** Render / Railway

---

## Overview

This is the backend API for **InternshipWala Careers** — India's leading online internship training platform. It connects students with internship programs, manages learning progression, handles certificate issuance, and provides an admin control panel for complete platform management.

---

## Architecture

The backend follows a clean **layered REST API architecture**:

```
Request → Route → Middleware → Controller → Service → Repository → PostgreSQL
```

- **Controllers** — HTTP boundary only (no business logic)
- **Services** — All business rules and orchestration
- **Repositories** — All Prisma/database queries
- **Middlewares** — Auth guards, validation, rate limiting, security

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Authentication | JWT (HS256) — separate secrets for students and admins |
| Password Hashing | bcrypt (cost factor 12) |
| Validation | Zod |
| File Uploads | Multer (local disk storage) |
| Email | Nodemailer (SMTP) |
| Logging | Winston |
| Scheduled Jobs | node-cron |
| Security | Helmet, CORS, xss-clean, hpp, express-rate-limit |
| Deployment | Render / Railway |

---

## Features

### Student-Facing
- Registration with OTP email verification
- JWT login and secure session management
- Profile and academic information management
- Course browsing by department, type, and category
- Enrollment with payment record creation (atomic transaction)
- Sequential module access (gated progression)
- Assignment and project submission
- Automatic certificate generation on course completion
- Certificate verification (public endpoint)
- Payment history and receipt viewing
- Job listings and application submission
- Notifications and platform announcements
- Study abroad programme browsing and applications

### Admin Panel
- Separate admin login with RBAC (roles + granular permissions)
- Course CRUD with module and duration/fee management
- Student management (view, search, filter, deactivate)
- Manual payment confirmation and rejection
- Refund processing
- Certificate approval and hard copy dispatch tracking
- Admin dashboard with live statistics
- Blog post and category management
- CMS for carousel slides, testimonials, static pages, settings
- Event, board member, and video gallery management
- Collaboration request management (institution, industry, student chapters)
- Contact message management
- Bulk and individual student notifications
- Activity audit logs for all sensitive admin operations

---

## Project Structure

```
internshipwala-backend/
├── prisma/
│   ├── schema.prisma          # 40-table PostgreSQL schema
│   └── seed.ts                # Seed: admin, roles, permissions, settings
├── src/
│   ├── config/                # DB, JWT, mailer, upload configuration
│   ├── constants/             # Role names, permission names, enums
│   ├── types/                 # TypeScript interfaces and Express augmentation
│   ├── utils/                 # Pure helpers (response, pagination, hash, OTP, slug)
│   ├── middlewares/           # Auth, validation, error handler, rate limiter, security
│   ├── validators/            # Zod schemas for every request shape
│   ├── repositories/          # All Prisma queries (one file per entity)
│   ├── services/              # All business logic (one file per domain)
│   ├── controllers/           # HTTP handlers (one file per domain)
│   ├── routes/                # Route definitions and middleware attachment
│   │   └── admin/             # All admin route files
│   ├── jobs/                  # node-cron scheduled tasks
│   ├── logger/                # Winston logger configuration
│   └── app.ts                 # Express app factory
├── uploads/                   # Local file storage (gitignored)
│   ├── profiles/
│   ├── projects/
│   ├── assignments/
│   └── certificates/
├── docs/
│   └── api-spec.md
├── .env.example
├── package.json
├── tsconfig.json
└── server.ts                  # Entry point
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- SMTP email account

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd internshipwala-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# → Fill in all required values in .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
# After the migration file is created, add the partial unique index:
# CREATE UNIQUE INDEX uq_active_enrollment ON enrollments (user_id, course_id)
# WHERE deleted_at IS NULL AND status != 'cancelled';

# Seed the database
npx ts-node prisma/seed.ts

# Start in development
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

---

## Environment Variables

All required environment variables are listed in `.env.example`. The application **will not start** if any required variable is missing (validated by Zod on startup).

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon format with SSL) |
| `STUDENT_JWT_SECRET` | JWT signing secret for student tokens (min 32 chars) |
| `ADMIN_JWT_SECRET` | JWT signing secret for admin tokens (min 32 chars) |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port (587 for TLS) |
| `SMTP_USER` | SMTP authentication username |
| `SMTP_PASS` | SMTP authentication password |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins |
| `NODE_ENV` | `development` or `production` |
| `PORT` | HTTP server port (default: 3000) |

See `.env.example` for the complete list.

---

## API Overview

### Base URL

```
Production: https://api.internshipwala.com/api
Development: http://localhost:3000/api
```

### Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Student tokens are issued by `POST /api/auth/login`.
Admin tokens are issued by `POST /api/auth/admin/login`.

### Key Endpoints

| Group | Endpoint | Auth |
|-------|---------|------|
| Auth | `POST /api/auth/register` | None |
| Auth | `POST /api/auth/login` | None |
| Auth | `POST /api/auth/verify-otp` | None |
| Courses | `GET /api/courses` | None |
| Courses | `GET /api/courses/:id` | None |
| Enrollment | `POST /api/enrollments` | Student |
| Enrollment | `GET /api/enrollments/mine` | Student |
| Learning | `POST /api/enrollments/:id/modules/:moduleId/complete` | Student |
| Certificates | `GET /api/certificates/verify/:cert_number` | None |
| Jobs | `GET /api/jobs` | None |
| Blog | `GET /api/blog` | None |
| Public CMS | `GET /api/public/carousel` | None |
| Admin Dashboard | `GET /api/admin/dashboard` | Admin |
| Admin Courses | `POST /api/admin/courses` | Admin |
| Admin Payments | `PATCH /api/admin/payments/:id/confirm` | Admin |

Full API reference: `docs/api-spec.md`

---

## Database

The schema contains **40 tables** covering:

- Core: `users`, `admin_users`, `roles`, `permissions`
- Catalog: `courses`, `course_categories`, `course_modules`, `course_duration_fees`
- Learning: `enrollments`, `module_progress`, `assignments`, `assignment_submissions`
- Finance: `payments`, `refunds`
- Credentials: `certificates`, `certificate_hard_copy_requests`
- CMS: `carousel_slides`, `testimonials`, `blog_posts`, `blog_categories`
- Community: `events`, `student_chapters`, `board_members`
- Collaboration: `institution_collaborations`, `industry_academia_collaborations`
- Jobs: `job_listings`, `job_applications`
- Content: `video_gallery`, `online_projects`, `study_abroad_programs`
- Communication: `notifications`, `contact_messages`, `announcements`
- System: `cms_pages`, `settings`, `activity_logs`, `otp_verifications`

All primary keys are UUIDs. Soft deletes are applied to financially-linked entities.

### Key Design Decisions

- **Partial unique index** (`uq_active_enrollment`) allows re-enrollment after cancellation
- **Admin soft-delete only** — `admin_users.deleted_at` is used; hard deletes are blocked at service layer
- **Atomic enrollment** — enrollment + payment created in a single `$transaction`
- **Sequential module gating** — module N requires module N-1 to be completed

---

## Security

- Passwords hashed with bcrypt (cost 12)
- Separate JWT secrets for students and admins
- RBAC with roles and granular permissions for all admin operations
- Helmet HTTP security headers
- CORS whitelist
- XSS sanitization on all request inputs
- HTTP parameter pollution prevention
- Rate limiting on auth endpoints (20 req / 15 min) and global (100 req / min)
- Parameterized queries only via Prisma (no raw SQL injection risk)
- Environment variable validation on startup

---

## Logging

Winston is configured with:
- `error.log` — Error-level events only
- `combined.log` — All log levels
- Console output in development (colorized)
- HTTP request logging (method, URL, status, response time)
- Admin audit trail in `activity_logs` database table

---

## Scheduled Jobs

| Job | Schedule | Function |
|-----|----------|----------|
| OTP Cleanup | Every 30 minutes | Deletes expired OTP records from `otp_verifications` |

---

## Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | Authentication | Registration, OTP, login, password reset |
| 2 | User Profile | Profile and academic info management |
| 3 | Admin | Admin accounts, RBAC, activity logs |
| 4 | Courses | Course catalog, modules, duration/fee options |
| 5 | Enrollment | Enrollment lifecycle and module progression |
| 6 | Payments | Manual payment confirmation and refunds |
| 7 | Certificates | Digital certificate issuance and verification |
| 8 | Dashboard | Admin statistics and KPIs |
| 9 | Blog | Blog posts and categories |
| 10 | Jobs | Job and internship listings |
| 11 | CMS | Carousel, testimonials, static pages, settings |
| 12 | Notifications | Per-user notifications and bulk announcements |
| 13 | Collaborations | Institution, industry, and student chapter forms |
| 14 | Contact | Contact form management |
| 15 | Study Abroad | International programme listings and applications |
| 16 | Events | Platform event management |
| 17 | Board Members | Advisory board directory |
| 18 | Video Gallery | Student testimonial videos |

---

## Implementation Guide

For a complete implementation specification — including per-module file lists, method signatures, business rules, common pitfalls, and implementation order — see:

**`internshipwala-backend-spec.md`** (Backend Architecture & AI Implementation Specification v1.0)

That document is the primary reference for all architectural decisions and must be treated as the authoritative implementation guide.

---

## Deployment Checklist

Before deploying to production:

- [ ] Replace seed admin `password_hash` with real bcrypt hash
- [ ] Enable `pgcrypto` extension on Neon database
- [ ] Schedule OTP cleanup cron (handled in `server.ts`)
- [ ] Confirm Neon SSL is enabled (default on Neon)
- [ ] Set all JWT secrets in environment variables (min 64 chars recommended)
- [ ] Configure object store credentials if moving from local file storage
- [ ] Run full migration and seed on production database
- [ ] Verify `uq_active_enrollment` partial index exists
- [ ] Verify `admin_users.deleted_at` column exists
- [ ] Set `ALLOWED_ORIGINS` to production frontend domains only
- [ ] Confirm `NODE_ENV=production` suppresses debug logs and stack traces in responses

---

## Contact

**InternshipWala Careers**
Customer Care: +91-7070436444
Email: career.internshipwala@gmail.com
Website: [https://www.internshipwala.com](https://www.internshipwala.com)

---

*Company: Cloudtechz InternshipWALA Private Limited*
*CIN: U85500WB2024PTC268720 | Registered under MSME, Govt. of India | ISO Certified*
