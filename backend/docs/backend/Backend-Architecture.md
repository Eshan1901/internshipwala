# InternshipWala — Backend Architecture & AI Implementation Specification

> **Platform:** https://www.internshipwala.com
> **Company:** Cloudtechz InternshipWALA Private Limited
> **Spec Version:** 1.0
> **Database Design Source:** Database Design Document v1.1 (Production-Ready)
> **Stack:** Node.js · Express.js · PostgreSQL (Neon) · Prisma ORM · JWT · bcrypt · Multer · Winston
> **Deployment Target:** Render / Railway
> **Date:** June 28, 2026

---

## Table of Contents

1. [Backend Overview](#1-backend-overview)
2. [Project Folder Structure](#2-project-folder-structure)
3. [Module Breakdown](#3-module-breakdown)
4. [Controller Specification](#4-controller-specification)
5. [Service Layer Specification](#5-service-layer-specification)
6. [Repository Layer](#6-repository-layer)
7. [Middleware Design](#7-middleware-design)
8. [Authentication Flow](#8-authentication-flow)
9. [Validation Strategy](#9-validation-strategy)
10. [File Upload Architecture](#10-file-upload-architecture)
11. [Error Handling](#11-error-handling)
12. [Security Architecture](#12-security-architecture)
13. [Logging Strategy](#13-logging-strategy)
14. [Configuration Management](#14-configuration-management)
15. [Business Workflows](#15-business-workflows)
16. [Sequence Diagrams](#16-sequence-diagrams)
17. [Coding Standards](#17-coding-standards)
18. [AI Implementation Guide](#18-ai-implementation-guide)

---

## 1. Backend Overview

### 1.1 Purpose

The InternshipWala backend is the API layer powering India's leading online internship training platform. It manages student registration, course enrollment, payment verification, learning progress, certificate issuance, admin content management, notifications, and all supporting CMS features.

### 1.2 Scope

This backend serves two primary consumer surfaces:

- **Student-facing REST API** — registration, login, profile, course browsing, enrollment, learning, payments, certificates, jobs, notifications.
- **Admin REST API** — full CRUD for courses, students, payments, certificates, CMS content, job listings, analytics, and notifications.

It also supports public endpoints for the website homepage (carousel, testimonials, blog, events, board members, contact).

### 1.3 Goals

| # | Goal |
|---|------|
| 1 | Deliver a production-ready, clean REST API aligned to the v1.1 database schema |
| 2 | Implement JWT-based stateless authentication with role-based access control |
| 3 | Apply Prisma ORM for all database access — no raw SQL except where Prisma falls short |
| 4 | Ensure all business rules from the documentation are enforced at the service layer |
| 5 | Support file uploads (profiles, certificates, project submissions) via Multer (local storage) |
| 6 | Achieve consistent, predictable error handling and API response shapes across all endpoints |
| 7 | Produce structured logs via Winston for observability |
| 8 | Keep the architecture simple enough to deploy on Render/Railway without container orchestration |

### 1.4 Architectural Style

**REST API** — resource-oriented URL design, standard HTTP verbs, JSON request/response bodies, stateless JWT authentication.

### 1.5 Design Principles

- **Layered Architecture:** Every request passes through Route → Middleware → Controller → Service → Repository → Database. No layer is skipped.
- **Single Responsibility:** Each file has exactly one job. Controllers orchestrate; services contain logic; repositories handle Prisma queries.
- **No Raw SQL:** All database interaction is via Prisma Client. Exceptions must be documented inline.
- **Fail Fast:** Validation middleware rejects malformed requests before any business logic runs.
- **Database as Truth:** The v1.1 schema is canonical. The backend adapts to it — not the reverse.
- **Environment Config:** All secrets, credentials, and environment-specific values live in `.env`. Nothing is hardcoded.
- **Soft Deletes Respected:** All queries on soft-deletable entities (`users`, `admin_users`, `courses`, `enrollments`, `job_listings`) include `WHERE deleted_at IS NULL` unless specifically fetching historical records.

---

## 2. Project Folder Structure

```
internshipwala-backend/
│
├── prisma/
│   ├── schema.prisma          # Prisma schema — mirrors v1.1 database design exactly
│   └── seed.ts                # Seed script: default admin, roles, permissions, settings
│
├── src/
│   ├── config/
│   │   ├── database.ts        # Prisma client singleton instantiation
│   │   ├── env.ts             # Typed environment variable loader with validation
│   │   ├── jwt.ts             # JWT sign/verify helpers and config
│   │   ├── mailer.ts          # Nodemailer SMTP transporter configuration
│   │   └── upload.ts          # Multer instance configuration (storage, limits, filters)
│   │
│   ├── constants/
│   │   ├── roles.ts           # Role name constants: SUPER_ADMIN, CONTENT_MANAGER…
│   │   ├── permissions.ts     # Permission name constants: manage_courses, manage_students…
│   │   ├── enums.ts           # Re-export of all Prisma-generated ENUM types
│   │   └── messages.ts        # Standard API response messages (strings only)
│   │
│   ├── types/
│   │   ├── express.d.ts       # Augment Express Request: req.user, req.admin
│   │   ├── api.ts             # Shared response shape types
│   │   └── pagination.ts      # PaginationQuery, PaginatedResult generics
│   │
│   ├── utils/
│   │   ├── response.ts        # sendSuccess() and sendError() helpers
│   │   ├── pagination.ts      # buildPrismaSkipTake(), buildPaginationMeta()
│   │   ├── certNumber.ts      # generateCertNumber() → IW-YYYY-NNNNNN format
│   │   ├── otp.ts             # generateOtp() — 6-digit numeric OTP
│   │   ├── hash.ts            # hashPassword(), comparePassword() — bcrypt wrappers
│   │   └── slugify.ts         # URL-safe slug generator for blog posts / categories
│   │
│   ├── middlewares/
│   │   ├── authenticate.ts        # Verify student JWT; attach req.user
│   │   ├── authenticateAdmin.ts   # Verify admin JWT; attach req.admin
│   │   ├── authorize.ts           # Check req.user.role matches required role
│   │   ├── authorizePermission.ts # Check admin has specific permission
│   │   ├── validate.ts            # Run Zod schema; collect and return validation errors
│   │   ├── errorHandler.ts        # Global Express error handler
│   │   ├── notFound.ts            # 404 catch-all after all routes
│   │   ├── rateLimiter.ts         # express-rate-limit instances (auth, global)
│   │   ├── uploadMiddleware.ts    # Multer field wrappers for each upload type
│   │   ├── requestLogger.ts       # Winston request/response logger (Morgan-style)
│   │   └── security.ts            # Helmet, CORS, hpp, xss-clean wrappers
│   │
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── user.validator.ts
│   │   ├── admin.validator.ts
│   │   ├── course.validator.ts
│   │   ├── enrollment.validator.ts
│   │   ├── payment.validator.ts
│   │   ├── certificate.validator.ts
│   │   ├── blog.validator.ts
│   │   ├── event.validator.ts
│   │   ├── job.validator.ts
│   │   ├── cms.validator.ts
│   │   ├── contact.validator.ts
│   │   └── collaboration.validator.ts
│   │
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── admin.repository.ts
│   │   ├── otp.repository.ts
│   │   ├── course.repository.ts
│   │   ├── enrollment.repository.ts
│   │   ├── payment.repository.ts
│   │   ├── certificate.repository.ts
│   │   ├── blog.repository.ts
│   │   ├── event.repository.ts
│   │   ├── job.repository.ts
│   │   ├── notification.repository.ts
│   │   ├── cms.repository.ts
│   │   ├── boardMember.repository.ts
│   │   ├── testimonial.repository.ts
│   │   ├── collaboration.repository.ts
│   │   ├── dashboard.repository.ts
│   │   └── activityLog.repository.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── admin.service.ts
│   │   ├── course.service.ts
│   │   ├── enrollment.service.ts
│   │   ├── payment.service.ts
│   │   ├── certificate.service.ts
│   │   ├── blog.service.ts
│   │   ├── event.service.ts
│   │   ├── job.service.ts
│   │   ├── notification.service.ts
│   │   ├── cms.service.ts
│   │   ├── boardMember.service.ts
│   │   ├── collaboration.service.ts
│   │   ├── dashboard.service.ts
│   │   └── mail.service.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── course.controller.ts
│   │   ├── enrollment.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── certificate.controller.ts
│   │   ├── blog.controller.ts
│   │   ├── event.controller.ts
│   │   ├── job.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── cms.controller.ts
│   │   ├── boardMember.controller.ts
│   │   ├── collaboration.controller.ts
│   │   └── dashboard.controller.ts
│   │
│   ├── routes/
│   │   ├── index.ts               # Master router — mounts all sub-routers
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── admin/
│   │   │   ├── index.ts           # Admin router root
│   │   │   ├── courses.routes.ts
│   │   │   ├── students.routes.ts
│   │   │   ├── payments.routes.ts
│   │   │   ├── certificates.routes.ts
│   │   │   ├── jobs.routes.ts
│   │   │   ├── blog.routes.ts
│   │   │   ├── cms.routes.ts
│   │   │   ├── events.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   ├── notifications.routes.ts
│   │   │   └── collaborations.routes.ts
│   │   ├── courses.routes.ts
│   │   ├── enrollment.routes.ts
│   │   ├── jobs.routes.ts
│   │   ├── blog.routes.ts
│   │   ├── contact.routes.ts
│   │   └── public.routes.ts       # Homepage, board members, testimonials, events
│   │
│   ├── jobs/
│   │   └── otpCleanup.job.ts      # node-cron job: DELETE expired OTPs every 30 min
│   │
│   ├── logger/
│   │   └── winston.ts             # Winston logger configuration (transports, format)
│   │
│   └── app.ts                     # Express app factory: middleware stack + router mount
│
├── uploads/                        # Local Multer upload destination (gitignored)
│   ├── profiles/
│   ├── resumes/
│   ├── certificates/
│   └── projects/
│
├── docs/
│   └── api-spec.md                # (Optional) human-readable API reference
│
├── .env                            # Environment variables (never commit)
├── .env.example                    # Template with all required keys
├── .gitignore
├── package.json
├── tsconfig.json
└── server.ts                       # Entry point: create app, start HTTP server, run cron jobs
```

### Folder Responsibility Summary

| Folder | Responsibility |
|--------|----------------|
| `prisma/` | Schema definition and seed data. Single source of truth for DB structure |
| `src/config/` | Initialize external connections and services (DB, JWT, mailer, upload) |
| `src/constants/` | Shared string literals and enum re-exports; never contain logic |
| `src/types/` | TypeScript type definitions and interface extensions |
| `src/utils/` | Pure utility functions with no side effects or external dependencies |
| `src/middlewares/` | Express middleware: auth guards, validation runner, error handler |
| `src/validators/` | Zod schemas for every request body and query parameter |
| `src/repositories/` | All Prisma queries; the only files that import `PrismaClient` |
| `src/services/` | Business logic; call repositories and other services; never touch `req`/`res` |
| `src/controllers/` | HTTP boundary; parse request, call service, format and send response |
| `src/routes/` | Route definition and middleware attachment; no business logic |
| `src/jobs/` | Scheduled background tasks (OTP cleanup cron) |
| `src/logger/` | Winston instance and transport configuration |
| `uploads/` | Runtime file storage for Multer uploads; excluded from version control |
| `docs/` | Human-readable supplementary documentation |

---

## 3. Module Breakdown

### 3.1 Authentication Module

**Purpose:** Register and authenticate students and admins using JWT.

**Responsibilities:**
- Student registration with OTP verification flow
- Student and admin login; JWT issuance
- Password reset via OTP
- Refresh token handling (if implemented)
- Logout (client-side token discard; stateless)

**Database Tables Used:** `users`, `admin_users`, `otp_verifications`

**Dependencies:** `mail.service`, `otp.repository`, `user.repository`, `admin.repository`

**Business Rules:**
- Minimum age 14 (validated at application layer against `dob`)
- One account per email and per mobile number
- OTP expires in 15 minutes
- Passwords stored as bcrypt hash with cost factor ≥ 12
- Unverified accounts (`is_verified = FALSE`) cannot log in
- Admin login uses a separate endpoint and separate JWT secret

---

### 3.2 User (Student) Module

**Purpose:** Manage student profile, academic details, and profile photo.

**Responsibilities:**
- View and update personal and academic profile
- Upload and update profile photo
- Change password

**Database Tables Used:** `users`

**Dependencies:** `auth.service`, `upload.middleware`

**Business Rules:**
- Email and mobile are updatable but must remain unique across the platform
- Profile photo upload limited to JPEG/PNG, max 2 MB
- Students cannot modify `is_verified`, `is_active`, or `referral_code` via the API

---

### 3.3 Admin Module

**Purpose:** Admin account management and admin dashboard access control.

**Responsibilities:**
- Admin login and session management
- Admin CRUD (super-admin only)
- Role and permission assignment
- Activity log querying

**Database Tables Used:** `admin_users`, `roles`, `permissions`, `role_permissions`, `admin_user_roles`, `activity_logs`

**Dependencies:** `auth.service`

**Business Rules:**
- Admin accounts are never physically deleted — only soft-deleted via `deleted_at`
- A super-admin role must always exist; it cannot be deleted
- Every admin action on sensitive entities must create an `activity_logs` record

---

### 3.4 Course (Internship Program) Module

**Purpose:** Full lifecycle management of internship and training programs.

**Responsibilities:**
- Public course listing by category, type, and status
- Course detail view with duration/fee options and modules
- Admin CRUD for courses, categories, modules, and assignments
- Draft/publish/archive status management

**Database Tables Used:** `course_categories`, `courses`, `course_duration_fees`, `course_modules`, `assignments`

**Dependencies:** `admin.service`, `activityLog.service`

**Business Rules:**
- Only `published` courses appear in public listings
- Soft-deleted courses (`deleted_at IS NOT NULL`) are invisible to all non-admin queries
- A course cannot be deleted if active enrollments exist (return 409 Conflict)
- Module sequence numbers (`module_no`) must be unique per course
- `is_new_badge` is toggled manually by admin; auto-removal logic is out of scope for v1

---

### 3.5 Enrollment Module

**Purpose:** Manage student enrollment in courses, access activation, and progression gating.

**Responsibilities:**
- Create enrollment with payment record in a single transaction
- Activate enrollment after payment confirmation
- Gate module access based on prior module completion
- Cancel enrollment; trigger refund eligibility check

**Database Tables Used:** `enrollments`, `payments`, `module_progress`

**Dependencies:** `payment.service`, `notification.service`, `course.service`

**Business Rules:**
- Enrollment creation and payment record creation must be atomic (one transaction)
- A student cannot have two simultaneous active enrollments in the same course
- Re-enrollment after cancellation is permitted (uses partial unique index `uq_active_enrollment`)
- Module 2 is not accessible until Module 1 is marked complete (enforced at API layer)

---

### 3.6 Payment Module

**Purpose:** Record, verify, and manage fee transactions.

**Responsibilities:**
- Create payment record on enrollment initiation
- Admin payment confirmation (sets enrollment to `active`)
- Admin payment rejection
- Refund initiation and tracking

**Database Tables Used:** `payments`, `refunds`, `enrollments`

**Dependencies:** `enrollment.service`, `notification.service`

**Business Rules:**
- Payment gateway integration is OUT OF SCOPE for v1 — admin manually confirms payments
- Refund is eligible if: course hasn't started within 7 days of enrollment, OR student is unsatisfied before module 2 unlocks
- Payment gateway fee (configurable via `settings` table) is deducted from refund amount
- A refund record is inserted alongside status update on the payment row

---

### 3.7 Certificate Module

**Purpose:** Issue digital certificates upon course completion.

**Responsibilities:**
- Detect course completion (all modules complete)
- Generate unique certificate number (format: `IW-YYYY-NNNNNN`)
- Admin approval gate (if configured)
- Certificate PDF generation and storage
- Hard copy request management

**Database Tables Used:** `certificates`, `certificate_hard_copy_requests`, `enrollments`, `module_progress`

**Dependencies:** `notification.service`, `enrollment.service`

**Business Rules:**
- Certificate is issued only when `enrollment.status = 'completed'`
- Enrollment is marked `completed` when all modules have `is_completed = TRUE`
- Certificate number must be globally unique; use DB `UNIQUE` constraint as safety net
- Hard copy fee is retrieved from `settings` table

---

### 3.8 Blog Module

**Purpose:** Manage educational blog posts and categories.

**Responsibilities:**
- Public blog listing (published only) with pagination
- Blog post detail by slug
- Admin CRUD for posts and categories

**Database Tables Used:** `blog_posts`, `blog_categories`

**Dependencies:** `admin.service`

**Business Rules:**
- Slugs must be unique; auto-generated from title if not provided
- Only `published` posts appear in public listing
- `published_at` is set to `NOW()` on first publish action

---

### 3.9 Notification Module

**Purpose:** Deliver system notifications to individual students.

**Responsibilities:**
- Create notifications (triggered by other services)
- List user's notifications (unread first)
- Mark notification as read
- Mark all notifications as read

**Database Tables Used:** `notifications`, `announcements`

**Dependencies:** Used by enrollment, payment, certificate, and admin modules

**Business Rules:**
- Notifications are per-user; announcements are platform-wide (separate table)
- Announcements are soft-deletable (retraction support)

---

### 3.10 Jobs Module

**Purpose:** Manage job and internship listings for student browsing and application.

**Responsibilities:**
- Public job listing (by type: internship, job, teaching, corporate, overseas)
- Job detail view
- Student application submission
- Admin CRUD for listings
- Admin view of applicants per listing

**Database Tables Used:** `job_listings`, `job_applications`

**Business Rules:**
- Expired listings (`expires_at < NOW()`) are hidden from public listings
- A student may apply to the same listing only once
- Listings are soft-deleted (archived), never hard-deleted

---

### 3.11 CMS Module

**Purpose:** Admin management of all website content.

**Responsibilities:**
- Carousel slides (homepage hero banners)
- Testimonials (student feedback)
- Static CMS pages (About Us, Terms, Privacy Policy)
- Platform settings key-value store
- Announcements

**Database Tables Used:** `carousel_slides`, `testimonials`, `cms_pages`, `settings`, `announcements`

**Business Rules:**
- Carousel slides are ordered by `display_order`
- Settings values are free-form `TEXT`; type coercion happens at the service layer

---

### 3.12 Board Members Module

**Purpose:** Public advisory board and mentor directory.

**Responsibilities:**
- Searchable, filterable, sortable, paginated public listing
- Admin CRUD

**Database Tables Used:** `board_members`

**Business Rules:**
- Search by `full_name`, `designation`, `company`, `location_city`, `industry`
- Sort by `full_name`, `designation`, `location_city`, `display_order`
- Only `is_active = TRUE` records visible in public listing

---

### 3.13 Collaboration Module

**Purpose:** Handle institution collaboration, student chapter registration, and industry-academia applications.

**Responsibilities:**
- Public form submission for each collaboration type
- Admin listing with status filtering
- Admin approval/rejection with notes

**Database Tables Used:** `student_chapters`, `institution_collaborations`, `industry_academia_collaborations`

**Business Rules:**
- Default status is `pending` on submission
- Only admin with `manage_collaborations` permission can approve/reject
- `reviewed_by` FK must reference an active admin user

---

### 3.14 Dashboard Module

**Purpose:** Provide aggregate statistics for the admin dashboard.

**Responsibilities:**
- Total students, active enrollments, total revenue, pending payments
- Certificates issued, new registrations (7/30 day windows)
- Active job listings, active courses

**Database Tables Used:** All primary tables via aggregate queries

**Business Rules:**
- Dashboard queries must be performant; use COUNT with WHERE conditions, not full table scans
- All stats are computed fresh on each request in v1 (no caching layer)

---

### 3.15 Contact Module

**Purpose:** Accept and manage contact form submissions.

**Responsibilities:**
- Public contact form submission
- Admin listing with status filtering
- Admin mark-as-read and reply

**Database Tables Used:** `contact_messages`

**Business Rules:**
- Status transitions: `unread` → `read` → `replied` → `closed`
- `admin_reply` field populated when admin replies

---

### 3.16 Study Abroad Module

**Purpose:** Manage international education programmes and student applications.

**Responsibilities:**
- Public programme listing
- Programme detail view
- Student application submission
- Admin CRUD for programmes
- Admin view of applications

**Database Tables Used:** `study_abroad_programs`, `study_abroad_applications`

---

### 3.17 Video Gallery Module

**Purpose:** Manage student testimonial videos.

**Database Tables Used:** `video_gallery`

**Business Rules:**
- Videos ordered by `display_order`; only `is_active` records shown publicly

---

### 3.18 Events Module

**Purpose:** Manage platform events (webinars, offline batches).

**Database Tables Used:** `events`

**Business Rules:**
- Past events (`event_date < NOW()`) remain visible in public listing for historical reference

---

## 4. Controller Specification

### 4.1 AuthController (`src/controllers/auth.controller.ts`)

**Purpose:** HTTP boundary for all authentication operations.

| Method | Route | Input | Output | Auth | Description |
|--------|-------|-------|--------|------|-------------|
| `register` | `POST /api/auth/register` | `{ full_name, email, mobile, password, college_name, present_course, year_qualifying, state, referral_code? }` | `201 { message, userId }` | None | Create user, send OTP |
| `verifyOtp` | `POST /api/auth/verify-otp` | `{ email, otp_code, purpose }` | `200 { message }` | None | Verify OTP, activate account |
| `resendOtp` | `POST /api/auth/resend-otp` | `{ email, purpose }` | `200 { message }` | None | Resend OTP |
| `login` | `POST /api/auth/login` | `{ email, password }` | `200 { token, user }` | None | Student login |
| `adminLogin` | `POST /api/auth/admin/login` | `{ email, password }` | `200 { token, admin }` | None | Admin login |
| `forgotPassword` | `POST /api/auth/forgot-password` | `{ email }` | `200 { message }` | None | Initiate password reset |
| `resetPassword` | `POST /api/auth/reset-password` | `{ email, otp_code, new_password }` | `200 { message }` | None | Complete password reset |
| `changePassword` | `PUT /api/auth/change-password` | `{ current_password, new_password }` | `200 { message }` | Student JWT | Change password |

**Error Handling:**
- `400` — Validation errors
- `401` — Invalid credentials or expired/invalid OTP
- `409` — Email or mobile already registered
- `403` — Account not verified or deactivated

**Dependencies:** `auth.service`

---

### 4.2 UserController (`src/controllers/user.controller.ts`)

**Purpose:** Student profile management.

| Method | Route | Input | Output | Auth |
|--------|-------|-------|--------|------|
| `getProfile` | `GET /api/user/profile` | — | `200 { user }` | Student JWT |
| `updateProfile` | `PUT /api/user/profile` | Body: profile fields | `200 { user }` | Student JWT |
| `uploadPhoto` | `POST /api/user/profile/photo` | `multipart: profile_photo` | `200 { profile_photo_url }` | Student JWT |

---

### 4.3 CourseController (`src/controllers/course.controller.ts`)

**Purpose:** Public and admin course operations.

| Method | Route | Input | Output | Auth |
|--------|-------|-------|--------|------|
| `listPublic` | `GET /api/courses` | Query: `category`, `type`, `page`, `limit` | `200 { courses[], meta }` | None |
| `getDetail` | `GET /api/courses/:id` | Param: `id` | `200 { course, modules, durationFees }` | None |
| `listCategories` | `GET /api/courses/categories` | — | `200 { categories[] }` | None |
| `adminCreate` | `POST /api/admin/courses` | Body: course fields | `201 { course }` | Admin |
| `adminUpdate` | `PUT /api/admin/courses/:id` | Body: partial course fields | `200 { course }` | Admin |
| `adminDelete` | `DELETE /api/admin/courses/:id` | Param: `id` | `200 { message }` | Admin |
| `adminPublish` | `PATCH /api/admin/courses/:id/publish` | — | `200 { course }` | Admin |
| `adminAddModule` | `POST /api/admin/courses/:id/modules` | Body: module fields | `201 { module }` | Admin |
| `adminUpdateModule` | `PUT /api/admin/courses/:id/modules/:moduleId` | Body: module fields | `200 { module }` | Admin |
| `adminDeleteModule` | `DELETE /api/admin/courses/:id/modules/:moduleId` | — | `200 { message }` | Admin |
| `adminAddDurationFee` | `POST /api/admin/courses/:id/duration-fees` | Body: `{ duration_weeks, label, fee }` | `201 { durationFee }` | Admin |

---

### 4.4 EnrollmentController (`src/controllers/enrollment.controller.ts`)

**Purpose:** Student enrollment lifecycle.

| Method | Route | Input | Output | Auth |
|--------|-------|-------|--------|------|
| `enroll` | `POST /api/enrollments` | `{ course_id, duration_fee_id }` | `201 { enrollment, payment }` | Student JWT |
| `myEnrollments` | `GET /api/enrollments/mine` | Query: `status` | `200 { enrollments[] }` | Student JWT |
| `getModules` | `GET /api/enrollments/:id/modules` | Param: `id` | `200 { modules[], progress[] }` | Student JWT |
| `markModuleComplete` | `POST /api/enrollments/:id/modules/:moduleId/complete` | — | `200 { progress, enrollmentStatus }` | Student JWT |
| `submitAssignment` | `POST /api/enrollments/:id/assignments/:assignmentId/submit` | Body/file | `201 { submission }` | Student JWT |
| `adminList` | `GET /api/admin/enrollments` | Query: filters, pagination | `200 { enrollments[], meta }` | Admin |
| `adminActivate` | `PATCH /api/admin/enrollments/:id/activate` | — | `200 { enrollment }` | Admin |
| `adminCancel` | `PATCH /api/admin/enrollments/:id/cancel` | — | `200 { enrollment }` | Admin |

---

### 4.5 PaymentController (`src/controllers/payment.controller.ts`)

**Purpose:** Payment record management.

| Method | Route | Input | Output | Auth |
|--------|-------|-------|--------|------|
| `myPayments` | `GET /api/payments/mine` | Query: pagination | `200 { payments[], meta }` | Student JWT |
| `adminList` | `GET /api/admin/payments` | Query: `status`, `page`, `limit` | `200 { payments[], meta }` | Admin |
| `adminConfirm` | `PATCH /api/admin/payments/:id/confirm` | Body: `{ gateway_txn_id }` | `200 { payment }` | Admin |
| `adminReject` | `PATCH /api/admin/payments/:id/reject` | — | `200 { payment }` | Admin |
| `adminRefund` | `POST /api/admin/payments/:id/refund` | Body: `{ refund_amount, reason }` | `201 { refund }` | Admin |

---

### 4.6 CertificateController (`src/controllers/certificate.controller.ts`)

**Purpose:** Digital certificate issuance and hard copy management.

| Method | Route | Input | Output | Auth |
|--------|-------|-------|--------|------|
| `myCertificates` | `GET /api/certificates/mine` | — | `200 { certificates[] }` | Student JWT |
| `download` | `GET /api/certificates/:id/download` | Param: `id` | `200 (redirect to PDF URL)` | Student JWT |
| `verify` | `GET /api/certificates/verify/:cert_number` | Param: cert number | `200 { certificate, student, course }` | None (public) |
| `requestHardCopy` | `POST /api/certificates/:id/hard-copy` | Body: `{ shipping_address }` | `201 { request }` | Student JWT |
| `adminList` | `GET /api/admin/certificates` | Query: pagination | `200 { certificates[], meta }` | Admin |
| `adminApprove` | `PATCH /api/admin/certificates/:id/approve` | — | `200 { certificate }` | Admin |
| `adminUpdateHardCopy` | `PATCH /api/admin/certificates/hard-copy/:requestId` | Body: `{ status }` | `200 { request }` | Admin |

---

### 4.7 DashboardController (`src/controllers/dashboard.controller.ts`)

**Purpose:** Admin dashboard statistics.

| Method | Route | Input | Output | Auth |
|--------|-------|-------|--------|------|
| `getStats` | `GET /api/admin/dashboard` | — | `200 { stats }` | Admin |

**Stats shape:**
```json
{
  "total_students": 0,
  "active_enrollments": 0,
  "total_revenue": 0,
  "pending_payments": 0,
  "certificates_issued": 0,
  "new_registrations_7d": 0,
  "new_registrations_30d": 0,
  "active_job_listings": 0,
  "active_courses": 0
}
```

---

### 4.8 BlogController, EventController, JobController, NotificationController, CmsController, BoardMemberController, CollaborationController, ContactController

Each follows the same pattern:

- **Public GET** — No auth required; returns published/active records
- **Admin GET/POST/PUT/DELETE** — Requires admin JWT and appropriate permission

Full method tables for each of these controllers follow the same structure as above and are detailed in Section 18 (AI Implementation Guide) per module.

---

## 5. Service Layer Specification

### 5.1 AuthService (`src/services/auth.service.ts`)

**Responsibilities:** Business logic for all authentication operations.

**Methods:**

| Method | Signature | Business Logic |
|--------|-----------|----------------|
| `register` | `(dto: RegisterDto) → Promise<{ userId }>` | Hash password; create user with `is_verified=FALSE`; generate OTP; send OTP via email |
| `verifyOtp` | `(dto: VerifyOtpDto) → Promise<void>` | Find valid, unused, non-expired OTP; mark `is_used=TRUE`; set user `is_verified=TRUE` |
| `resendOtp` | `(email, purpose) → Promise<void>` | Invalidate old OTPs for this target+purpose; create new OTP; send via email |
| `login` | `(dto: LoginDto) → Promise<{ token, user }>` | Find active verified user; compare password; update `last_login_at`; sign JWT |
| `adminLogin` | `(dto: AdminLoginDto) → Promise<{ token, admin }>` | Find active admin (deleted_at IS NULL); compare password; sign admin JWT with roles |
| `forgotPassword` | `(email) → Promise<void>` | Validate user exists; generate OTP; send password reset email |
| `resetPassword` | `(dto: ResetPasswordDto) → Promise<void>` | Verify OTP (purpose=password_reset); hash new password; update user |
| `changePassword` | `(userId, dto) → Promise<void>` | Compare current password; hash and save new password |

**Error Cases:**
- User not found → `AppError(404, 'User not found')`
- Wrong password → `AppError(401, 'Invalid credentials')`
- OTP expired/invalid/used → `AppError(401, 'Invalid or expired OTP')`
- Account not verified → `AppError(403, 'Email not verified')`
- Account deactivated → `AppError(403, 'Account has been deactivated')`

**Transactions:** `verifyOtp` and `resetPassword` use Prisma `$transaction` to atomically mark OTP used and update user.

---

### 5.2 CourseService (`src/services/course.service.ts`)

**Methods:**

| Method | Logic |
|--------|-------|
| `listPublic(filters)` | Query published, non-deleted courses; apply category/type filters; paginate |
| `getDetail(id)` | Fetch course with category, modules (ordered by `module_no`), duration-fee options |
| `create(adminId, dto)` | Create course; log activity |
| `update(adminId, id, dto)` | Update course; check no conflict; log activity |
| `softDelete(adminId, id)` | Check for active enrollments; if none, set `deleted_at`; log activity |
| `publish(adminId, id)` | Set status to `published`; log activity |
| `addModule(courseId, dto)` | Validate `module_no` uniqueness; insert module |
| `addDurationFee(courseId, dto)` | Insert duration-fee record |

**Error Cases:**
- Delete with active enrollments → `AppError(409, 'Cannot delete course with active enrollments')`
- Duplicate module_no → `AppError(409, 'Module number already exists for this course')`

---

### 5.3 EnrollmentService (`src/services/enrollment.service.ts`)

**Methods:**

| Method | Logic |
|--------|-------|
| `enroll(userId, dto)` | Validate course published; check `uq_active_enrollment`; create enrollment + payment in `$transaction`; notify student |
| `activateEnrollment(adminId, enrollmentId)` | Set enrollment `status='active'`; set payment `status='success'`; notify student |
| `cancelEnrollment(adminId, enrollmentId)` | Set enrollment `status='cancelled'`; log activity |
| `getModulesWithProgress(userId, enrollmentId)` | Verify enrollment belongs to user; fetch modules; join with progress |
| `markModuleComplete(userId, enrollmentId, moduleId)` | Verify sequential access (prior module must be complete); upsert `module_progress`; check if all modules done → mark enrollment completed → trigger certificate generation |
| `submitAssignment(userId, enrollmentId, assignmentId, dto)` | Validate enrollment active; upsert submission |

**Key Business Rule Implementation (Module Gating):**
```
For module N:
  If N == 1 → allow access
  Else → check module_progress WHERE module_id = module(N-1).id AND is_completed = TRUE
  If not found → throw AppError(403, 'Complete previous module first')
```

**Transactions:** `enroll` uses `$transaction([createEnrollment, createPayment])`

---

### 5.4 PaymentService (`src/services/payment.service.ts`)

**Methods:**

| Method | Logic |
|--------|-------|
| `confirmPayment(adminId, paymentId, txnId)` | Set payment `status='success'`, `gateway_txn_id`, `paid_at`; activate enrollment; notify student |
| `rejectPayment(adminId, paymentId)` | Set payment `status='failed'`; notify student |
| `initiateRefund(adminId, paymentId, dto)` | Validate payment is `success`; check refund eligibility rules; create `refunds` record; set payment `status='refunded'` |

**Refund Eligibility Rules (in service layer):**
1. Enrollment `enrolled_at` < `NOW() - 7 days` and course hasn't started → eligible
2. Student completed less than module 2 → eligible
3. Otherwise → not eligible (throw `AppError(400, 'Refund conditions not met')`)

---

### 5.5 CertificateService (`src/services/certificate.service.ts`)

**Methods:**

| Method | Logic |
|--------|-------|
| `generateCertificate(enrollmentId)` | Called by `EnrollmentService.markModuleComplete` when enrollment reaches `completed`; generate cert number; create `certificates` record; notify student |
| `approveCertificate(adminId, certId)` | Set `admin_approved=TRUE`; trigger PDF generation (placeholder in v1) |
| `verifyCertificate(certNumber)` | Find certificate; return with student name, course, issued date |
| `requestHardCopy(userId, certId, dto)` | Validate certificate belongs to user and `admin_approved=TRUE`; fetch `hard_copy_fee` from settings; create `certificate_hard_copy_requests` |

**Certificate Number Generation:**
```
Format: IW-{YEAR}-{SEQUENCE}
Sequence: fetch MAX(cert_number) from certificates for current year; increment; zero-pad to 6 digits
Fallback: if DB UNIQUE constraint violation, retry with incremented sequence
```

---

### 5.6 NotificationService (`src/services/notification.service.ts`)

**Methods:**

| Method | Logic |
|--------|-------|
| `send(userId, title, message, type)` | Insert into `notifications`; optionally send email via `MailService` |
| `listForUser(userId, page, limit)` | Fetch notifications ordered by `created_at DESC`; paginate |
| `markRead(userId, notificationId)` | Set `is_read=TRUE`; verify ownership |
| `markAllRead(userId)` | Bulk update `is_read=TRUE WHERE user_id = userId AND is_read = FALSE` |

---

### 5.7 MailService (`src/services/mail.service.ts`)

**Methods:**

| Method | Template |
|--------|----------|
| `sendOtp(email, otp, purpose)` | OTP email with expiry warning |
| `sendWelcome(email, fullName)` | Welcome after OTP verification |
| `sendEnrollmentConfirmation(email, courseName)` | Enrollment receipt |
| `sendCertificateReady(email, certNumber)` | Certificate issued notification |
| `sendPasswordReset(email, otp)` | Password reset OTP |

All mail methods are fire-and-forget. Errors are logged but never thrown to the caller.

---

### 5.8 DashboardService (`src/services/dashboard.service.ts`)

**Methods:**

| Method | Queries |
|--------|---------|
| `getStats()` | Runs parallel `COUNT` queries via `Promise.all`: total students, active enrollments, revenue sum, pending payments count, certificates issued, new registrations in 7d/30d windows, active job listings, active courses |

---

## 6. Repository Layer

Repositories are the ONLY files that import `PrismaClient`. Every method takes typed input and returns typed Prisma output or `null`.

### 6.1 UserRepository (`src/repositories/user.repository.ts`)

| Method | Prisma Operation |
|--------|-----------------|
| `create(data)` | `prisma.users.create()` |
| `findByEmail(email)` | `prisma.users.findUnique({ where: { email, deleted_at: null } })` |
| `findByMobile(mobile)` | `prisma.users.findUnique({ where: { mobile, deleted_at: null } })` |
| `findById(id)` | `prisma.users.findFirst({ where: { id, deleted_at: null } })` |
| `update(id, data)` | `prisma.users.update({ where: { id }, data })` |
| `softDelete(id)` | `prisma.users.update({ where: { id }, data: { deleted_at: new Date() } })` |
| `list(filters, pagination)` | `prisma.users.findMany()` with where/skip/take/orderBy |
| `count(filters)` | `prisma.users.count()` |
| `updateLastLogin(id)` | `prisma.users.update({ data: { last_login_at: new Date() } })` |

---

### 6.2 OtpRepository (`src/repositories/otp.repository.ts`)

| Method | Prisma Operation |
|--------|-----------------|
| `create(target, purpose, code, expiresAt)` | `prisma.otp_verifications.create()` |
| `findValid(target, purpose, code)` | `findFirst WHERE target, purpose, otp_code, is_used=FALSE, expires_at > NOW()` |
| `markUsed(id)` | `prisma.otp_verifications.update({ data: { is_used: true } })` |
| `invalidateOld(target, purpose)` | `prisma.otp_verifications.updateMany({ where: { target, purpose, is_used: false }, data: { is_used: true } })` |
| `deleteExpired()` | `prisma.otp_verifications.deleteMany({ where: { expires_at: { lt: new Date() } } })` |

---

### 6.3 CourseRepository (`src/repositories/course.repository.ts`)

| Method | Notes |
|--------|-------|
| `listPublished(filters, pagination)` | Filters: `category_id`, `type`; WHERE `status='published'` AND `deleted_at IS NULL` |
| `findById(id)` | Include `category`, `course_duration_fees`, `course_modules` ordered by `module_no` |
| `findByIdAdmin(id)` | Include all relations; no `deleted_at` filter |
| `create(adminId, data)` | Create with `created_by` |
| `update(id, data)` | Standard update |
| `softDelete(id)` | Set `deleted_at` |
| `checkActiveEnrollments(courseId)` | `COUNT enrollments WHERE course_id AND status IN ('pending','active')` |
| `listAdmin(filters, pagination)` | No deleted_at filter for admin view |

---

### 6.4 EnrollmentRepository (`src/repositories/enrollment.repository.ts`)

| Method | Notes |
|--------|-------|
| `createWithPayment(enrollmentData, paymentData)` | `prisma.$transaction([create enrollment, create payment])` |
| `findById(id)` | Include user, course, payment |
| `findByUserAndCourse(userId, courseId)` | Check active enrollment (not cancelled, not deleted) |
| `findUserEnrollments(userId, statusFilter)` | Include course, progress summary |
| `listAdmin(filters, pagination)` | All enrollments for admin |
| `updateStatus(id, status)` | Set `status`; set `completed_at` if completing |
| `softDelete(id)` | Set `deleted_at` |

---

### 6.5 PaymentRepository (`src/repositories/payment.repository.ts`)

| Method | Notes |
|--------|-------|
| `findById(id)` | Include enrollment, user |
| `listAdmin(filters, pagination)` | Filter by `status` |
| `updateStatus(id, data)` | Update `status`, `gateway_txn_id`, `paid_at` |
| `createRefund(data)` | Insert into `refunds`; run in transaction with payment update |
| `sumRevenue()` | `SUM amount WHERE status='success'` |
| `countPending()` | `COUNT WHERE status='pending'` |

---

### 6.6 CertificateRepository (`src/repositories/certificate.repository.ts`)

| Method | Notes |
|--------|-------|
| `create(data)` | Insert certificate; cert_number must be unique |
| `findByCertNumber(certNumber)` | Public verification query; include user + course |
| `findByUserId(userId)` | List student's certificates |
| `findById(id)` | Include user, enrollment, course |
| `approve(id)` | Set `admin_approved=TRUE` |
| `createHardCopyRequest(data)` | Insert into `certificate_hard_copy_requests` |
| `updateHardCopyStatus(requestId, status)` | Update dispatch status |
| `countIssued()` | `COUNT WHERE admin_approved=TRUE` |

---

### 6.7 ModuleProgressRepository (`src/repositories/moduleProgress.repository.ts`)

| Method | Notes |
|--------|-------|
| `upsertCompletion(userId, moduleId, enrollmentId)` | `upsert` with `is_completed=TRUE`, `completed_at=NOW()` |
| `getProgress(userId, enrollmentId)` | All progress records for an enrollment |
| `countCompleted(enrollmentId)` | COUNT completed modules |
| `isModuleCompleted(userId, moduleId)` | Check single module completion |

---

### 6.8 DashboardRepository (`src/repositories/dashboard.repository.ts`)

All methods run raw aggregate COUNT/SUM queries via Prisma:

| Method | Query |
|--------|-------|
| `countStudents()` | `COUNT users WHERE deleted_at IS NULL` |
| `countActiveEnrollments()` | `COUNT enrollments WHERE status='active'` |
| `sumRevenue()` | `SUM payments.amount WHERE status='success'` |
| `countPendingPayments()` | `COUNT payments WHERE status='pending'` |
| `countCertificates()` | `COUNT certificates WHERE admin_approved=TRUE` |
| `countNewRegistrations(days)` | `COUNT users WHERE created_at > NOW() - interval` |
| `countActiveJobs()` | `COUNT job_listings WHERE is_active=TRUE AND deleted_at IS NULL` |
| `countActiveCourses()` | `COUNT courses WHERE status='published' AND deleted_at IS NULL` |

---

## 7. Middleware Design

### 7.1 Authentication Middleware

**`authenticate.ts`** — Protects student routes.

```
Algorithm:
1. Extract Bearer token from Authorization header
2. If missing → 401 Unauthorized
3. Verify JWT with STUDENT_JWT_SECRET
4. If invalid/expired → 401 Unauthorized
5. Find user by id in payload; check deleted_at IS NULL AND is_active=TRUE AND is_verified=TRUE
6. If not found → 401 Unauthorized
7. Attach user to req.user; call next()
```

**`authenticateAdmin.ts`** — Protects admin routes.

```
Algorithm:
1-4. Same as above but verify with ADMIN_JWT_SECRET
5. Find admin_user WHERE id = payload.id AND deleted_at IS NULL AND is_active=TRUE
6. Load admin's roles and permissions (include in query)
7. Attach admin to req.admin with roles and permissions array; call next()
```

---

### 7.2 Authorization Middleware

**`authorize.ts`** — Role check for student routes (if role-specific student features are added in v2).

**`authorizePermission.ts`** — Permission check for admin routes.

```typescript
// Usage in routes:
router.post('/courses', authenticateAdmin, authorizePermission('manage_courses'), ...)

// Implementation:
export const authorizePermission = (permission: string) => (req, res, next) => {
  const admin = req.admin;
  const hasPermission = admin.permissions.includes(permission) || admin.roles.includes('super_admin');
  if (!hasPermission) return next(new AppError(403, 'Insufficient permissions'));
  next();
};
```

---

### 7.3 Validation Middleware

**`validate.ts`** — Runs a Zod schema against `req.body`, `req.params`, or `req.query`.

```typescript
export const validate = (schema: ZodSchema, target: 'body' | 'params' | 'query' = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = result.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
      return next(new AppError(400, 'Validation failed', errors));
    }
    req[target] = result.data; // coerced and sanitized
    next();
  };
```

---

### 7.4 Error Handler Middleware

**`errorHandler.ts`** — Global Express error handler (must be last in middleware stack).

```
Handles:
- AppError (custom class) → use statusCode and message
- Prisma P2002 (unique constraint) → 409 Conflict with field name
- Prisma P2025 (record not found) → 404 Not Found
- Zod errors (should be caught by validate middleware; fallback here)
- Generic Error → 500 Internal Server Error (log full stack; return sanitized message)

Never expose stack traces or internal DB details in production responses.
```

---

### 7.5 Rate Limiter

**`rateLimiter.ts`** — Three tiers:

| Limiter | Routes | Window | Max Requests |
|---------|--------|--------|-------------|
| `authLimiter` | `/api/auth/*` | 15 minutes | 20 |
| `otpLimiter` | `/api/auth/resend-otp`, `/api/auth/verify-otp` | 15 minutes | 5 |
| `globalLimiter` | All routes | 1 minute | 100 |

Use `express-rate-limit` with in-memory store (no Redis dependency).

---

### 7.6 Logger Middleware

**`requestLogger.ts`** — Log each request and response.

```
Log fields: timestamp, method, url, status, response_time_ms, ip, user_agent
Log level: 'http' for 2xx/3xx; 'warn' for 4xx; 'error' for 5xx
```

---

### 7.7 File Upload Middleware

**`uploadMiddleware.ts`** — Multer field configurations.

| Upload | Field Name | Allowed Types | Max Size |
|--------|-----------|---------------|----------|
| Profile photo | `profile_photo` | JPEG, PNG | 2 MB |
| Project file | `project_file` | PDF, ZIP, DOCX | 10 MB |
| Assignment file | `assignment_file` | PDF, ZIP, DOCX, PNG, JPEG | 10 MB |

```typescript
// Each export is a configured multer().single() or multer().fields() call
export const uploadProfilePhoto = multer({ storage, fileFilter, limits }).single('profile_photo');
```

---

### 7.8 Security Middleware

**`security.ts`** — Applied globally in `app.ts`:

| Middleware | Package | Purpose |
|-----------|---------|---------|
| `helmet()` | `helmet` | Set security HTTP headers |
| `cors(corsOptions)` | `cors` | Restrict origins to allowed frontend domains |
| `xssClean()` | `xss-clean` | Sanitize request body against XSS |
| `hpp()` | `hpp` | Prevent HTTP parameter pollution |
| `express.json({ limit: '10kb' })` | built-in | Limit request body size |

---

## 8. Authentication Flow

### 8.1 Registration Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Route
    participant V as Validator
    participant Ctrl as AuthController
    participant S as AuthService
    participant UR as UserRepository
    participant OR as OtpRepository
    participant M as MailService
    participant DB as PostgreSQL

    C->>R: POST /api/auth/register
    R->>V: validate(registerSchema)
    V-->>C: 400 if validation fails
    V->>Ctrl: next()
    Ctrl->>S: register(dto)
    S->>UR: findByEmail(email)
    UR->>DB: SELECT users WHERE email
    DB-->>UR: null or user
    alt Email exists
        S-->>Ctrl: throw AppError(409)
        Ctrl-->>C: 409 Email already registered
    end
    S->>S: hashPassword(password)
    S->>UR: create(userData)
    UR->>DB: INSERT INTO users
    DB-->>UR: user
    S->>S: generateOtp()
    S->>OR: create(email, 'registration', otp, expires)
    OR->>DB: INSERT INTO otp_verifications
    S->>M: sendOtp(email, otp, 'registration')
    M-->>C: OTP email delivered (async)
    S-->>Ctrl: { userId }
    Ctrl-->>C: 201 { message: 'OTP sent', userId }
```

### 8.2 Login Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant Ctrl as AuthController
    participant S as AuthService
    participant UR as UserRepository
    participant DB as PostgreSQL

    C->>Ctrl: POST /api/auth/login { email, password }
    Ctrl->>S: login(dto)
    S->>UR: findByEmail(email)
    UR->>DB: SELECT users WHERE email AND deleted_at IS NULL
    DB-->>UR: user or null
    alt User not found
        S-->>Ctrl: AppError(401, 'Invalid credentials')
    end
    S->>S: comparePassword(password, user.password_hash)
    alt Password mismatch
        S-->>Ctrl: AppError(401, 'Invalid credentials')
    end
    alt is_verified = FALSE
        S-->>Ctrl: AppError(403, 'Email not verified')
    end
    alt is_active = FALSE
        S-->>Ctrl: AppError(403, 'Account deactivated')
    end
    S->>UR: updateLastLogin(user.id)
    S->>S: signJWT({ id, email, role: 'student' })
    S-->>Ctrl: { token, user }
    Ctrl-->>C: 200 { token, user }
```

### 8.3 JWT Strategy

| Parameter | Student JWT | Admin JWT |
|-----------|------------|-----------|
| Secret | `STUDENT_JWT_SECRET` env var | `ADMIN_JWT_SECRET` env var |
| Payload | `{ id, email, role: 'student' }` | `{ id, email, roles: string[], permissions: string[] }` |
| Expiry | `7d` | `24h` |
| Algorithm | HS256 | HS256 |

**No refresh token in v1.** Clients re-login when token expires. This is acceptable for the platform's use case and eliminates token storage complexity.

### 8.4 Password Reset Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as AuthService
    participant OR as OtpRepository
    participant UR as UserRepository
    participant M as MailService

    C->>S: POST /api/auth/forgot-password { email }
    S->>UR: findByEmail(email)
    alt User not found
        S-->>C: 200 (do not reveal non-existence)
    end
    S->>OR: invalidateOld(email, 'password_reset')
    S->>S: generateOtp()
    S->>OR: create(email, 'password_reset', otp, +15min)
    S->>M: sendPasswordReset(email, otp)
    S-->>C: 200 { message: 'OTP sent if account exists' }

    C->>S: POST /api/auth/reset-password { email, otp_code, new_password }
    S->>OR: findValid(email, 'password_reset', otp_code)
    alt Invalid / expired OTP
        S-->>C: 401
    end
    S->>S: hashPassword(new_password)
    S->>DB: $transaction([markOtpUsed, updateUserPassword])
    S-->>C: 200 { message: 'Password reset successful' }
```

---

## 9. Validation Strategy

All validation uses **Zod schemas** defined in the `validators/` folder. The `validate` middleware applies schemas before the controller is invoked.

### 9.1 Auth Validators

| Schema | Rules |
|--------|-------|
| `registerSchema` | `full_name`: string, 2–150 chars; `email`: valid email; `mobile`: 10–15 chars, digits only; `password`: min 8 chars, at least 1 uppercase + 1 number; `college_name`: string, 2–200 chars; `present_course`: string; `year_qualifying`: string, 4 chars numeric; `state`: string |
| `verifyOtpSchema` | `email`: valid email; `otp_code`: 6-digit numeric string; `purpose`: enum `['registration', 'password_reset']` |
| `loginSchema` | `email`: valid email; `password`: non-empty string |
| `resetPasswordSchema` | `email`: valid email; `otp_code`: 6-digit; `new_password`: min 8 chars, uppercase + number |
| `changePasswordSchema` | `current_password`: non-empty; `new_password`: min 8 chars, uppercase + number |

### 9.2 User Profile Validators

| Field | Rule |
|-------|------|
| `full_name` | 2–150 chars |
| `mobile` | 10–15 digits |
| `dob` | Valid ISO date string; user must be ≥ 14 years old |
| `address` | Optional; max 500 chars |
| `city`, `state`, `country` | Optional; max 100 chars |
| `father_name` | Optional; max 150 chars |
| `present_course`, `branch` | Optional; max 100 chars |
| `year_qualifying` | Optional; 4-char numeric string |
| `college_name` | Optional; max 200 chars |

### 9.3 Course Validators

| Schema | Rules |
|--------|-------|
| `createCourseSchema` | `title`: 3–300 chars; `category_id`: valid UUID; `type`: enum `['online','offline','industrial']`; `status`: enum `['draft','published','archived']`; `description`: optional text |
| `createModuleSchema` | `module_no`: positive integer; `title`: 3–300 chars; `content_url`: optional URL; `content_type`: optional enum `['video','pdf','link']` |
| `createDurationFeeSchema` | `duration_weeks`: positive integer; `fee`: non-negative number; `label`: optional string |
| `createAssignmentSchema` | `title`: 3–300 chars; `type`: enum assignment types; `max_marks`: optional positive integer; `passing_marks`: optional non-negative ≤ max_marks |

### 9.4 Enrollment Validators

| Field | Rule |
|-------|------|
| `course_id` | Valid UUID |
| `duration_fee_id` | Valid UUID |

### 9.5 Payment Validators

| Schema | Rules |
|--------|-------|
| `confirmPaymentSchema` | `gateway_txn_id`: required string, 3–200 chars |
| `refundSchema` | `refund_amount`: positive number ≤ original payment amount; `reason`: required, 10–500 chars |

### 9.6 Certificate Validators

| Schema | Rules |
|--------|-------|
| `hardCopySchema` | `shipping_address`: required, 10–500 chars |

### 9.7 Blog Validators

| Field | Rule |
|-------|------|
| `title` | 3–300 chars |
| `content` | Min 100 chars |
| `category_id` | Valid UUID |
| `status` | enum `['draft','published','archived']` |
| `slug` | Optional; auto-generated if absent; URL-safe, lowercase, hyphens only |

### 9.8 File Upload Constraints

| Upload | Allowed MIME Types | Max Size |
|--------|-------------------|----------|
| Profile photo | `image/jpeg`, `image/png` | 2 MB |
| Project / assignment | `application/pdf`, `application/zip`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `image/jpeg`, `image/png` | 10 MB |

---

## 10. File Upload Architecture

### 10.1 Storage

Multer is configured for **local disk storage** (Render/Railway persistent disk or local in dev).

```
uploads/
├── profiles/       # Profile photos
├── projects/       # Student project submissions
├── assignments/    # Assignment file submissions
└── certificates/   # Generated PDF certificates (placeholder in v1)
```

### 10.2 Naming Convention

```
{entity}_{uuid}_{timestamp}.{ext}

Examples:
  profiles/profile_a1b2c3d4_1719500000000.jpg
  projects/project_e5f6g7h8_1719500000001.pdf
  assignments/assignment_i9j0k1l2_1719500000002.pdf
```

Implementation in `upload.ts`:
```typescript
filename: (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const name = `${file.fieldname}_${uuidv4()}_${Date.now()}${ext}`;
  cb(null, name);
}
```

### 10.3 URL Serving

Add static file serving in `app.ts`:
```typescript
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

The stored path in the database will be the relative URL: `/uploads/profiles/profile_xxx.jpg`

### 10.4 Allowed Formats

| Field | Allowed Extensions |
|-------|--------------------|
| `profile_photo` | `.jpg`, `.jpeg`, `.png` |
| `project_file` | `.pdf`, `.zip`, `.docx` |
| `assignment_file` | `.pdf`, `.zip`, `.docx`, `.jpg`, `.png` |

### 10.5 Validation in Multer fileFilter

```typescript
fileFilter: (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new AppError(400, 'Only JPEG and PNG files are allowed'));
  }
  cb(null, true);
}
```

---

## 11. Error Handling

### 11.1 AppError Class

```typescript
// src/utils/AppError.ts
export class AppError extends Error {
  statusCode: number;
  errors?: ValidationError[];
  isOperational: boolean;

  constructor(statusCode: number, message: string, errors?: ValidationError[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // operational errors are safe to expose to clients
  }
}
```

### 11.2 Standard Response Structure

**Success Response:**
```json
{
  "success": true,
  "message": "Human-readable success message",
  "data": { }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

**Paginated Response:**
```json
{
  "success": true,
  "message": "Courses fetched successfully",
  "data": [ ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### 11.3 HTTP Status Code Reference

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST creating a resource |
| 400 | Bad Request | Validation failure, malformed input |
| 401 | Unauthorized | Missing/invalid/expired JWT |
| 403 | Forbidden | Valid JWT but insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Unique constraint violation; duplicate enrollment |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unhandled exception |

### 11.4 Prisma Error Mapping

| Prisma Error Code | HTTP Status | Message |
|------------------|-------------|---------|
| `P2002` (unique constraint) | 409 | `'A record with this {field} already exists'` |
| `P2025` (record not found) | 404 | `'The requested resource was not found'` |
| `P2003` (foreign key constraint) | 400 | `'Referenced record does not exist'` |
| `P2016` (query interpretation) | 400 | `'Invalid query parameters'` |

---

## 12. Security Architecture

### 12.1 Password Hashing

- Algorithm: **bcrypt**, cost factor **12**
- Implemented via `hash.ts` utility using the `bcrypt` npm package
- Passwords are never logged, returned in API responses, or stored in plaintext

### 12.2 JWT Security

| Parameter | Value |
|-----------|-------|
| Student secret | `process.env.STUDENT_JWT_SECRET` — min 64 chars random string |
| Admin secret | `process.env.ADMIN_JWT_SECRET` — min 64 chars random string |
| Algorithm | HS256 |
| Student expiry | 7 days |
| Admin expiry | 24 hours |

Secrets must never be hardcoded. Rotate them to invalidate all active sessions.

### 12.3 RBAC Design

```
Admin User → has many → Roles
Role → has many → Permissions
Permission → { module: string, action: string }

Super Admin role: bypasses all permission checks
All other roles: checked against permission list on every protected route
```

Permission names follow the pattern: `manage_{module}` (e.g., `manage_courses`, `manage_students`, `manage_payments`, `manage_certificates`, `manage_content`, `manage_collaborations`).

### 12.4 SQL Injection Protection

Prisma ORM uses parameterized queries for all database operations. No string interpolation into SQL. The only risk point is if `prisma.$queryRaw` is used — this must be avoided unless absolutely necessary, and if used, must use Prisma's tagged template literal syntax.

### 12.5 XSS Prevention

- `xss-clean` middleware sanitizes all request body string values before they reach controllers
- Rich text fields (blog content, CMS pages) are sanitized before storage
- API responses are JSON — no HTML rendering from the backend

### 12.6 CORS Configuration

```typescript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS.split(','),  // whitelist frontend domains
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
```

### 12.7 Helmet

All standard Helmet protections enabled. Ensure `contentSecurityPolicy` does not break file serving.

### 12.8 Environment Variables

All secrets, credentials, and configuration are in `.env`. The `env.ts` config file validates all required variables on startup using Zod — if any required variable is missing, the application refuses to start.

---

## 13. Logging Strategy

### 13.1 Winston Configuration

```typescript
// src/logger/winston.ts
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    ...(process.env.NODE_ENV !== 'production'
      ? [new winston.transports.Console({ format: winston.format.colorize({ all: true }) })]
      : [])
  ]
});
```

### 13.2 Log Levels and Usage

| Level | Winston Level | Usage |
|-------|--------------|-------|
| Error | `error` | Unhandled exceptions, Prisma errors, mail failures |
| Warn | `warn` | 4xx errors, rate limit hits, suspicious activity |
| Info | `info` | Application startup, successful logins, enrollments created |
| HTTP | `http` | All HTTP requests (via requestLogger middleware) |
| Debug | `debug` | Development — query params, service inputs, OTP codes (dev only) |

### 13.3 Audit Logs

Admin actions on sensitive entities (courses, students, payments, certificates) are written to the `activity_logs` database table via `ActivityLogRepository`. This is a structured audit trail separate from the application log files.

Fields logged: `admin_user_id`, `action`, `entity_type`, `entity_id`, `before_data`, `after_data`, `ip_address`, `created_at`.

---

## 14. Configuration Management

### 14.1 Environment Variables

All required variables with types and examples:

```env
# Application
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://www.internshipwala.com,https://admin.internshipwala.com

# Database
DATABASE_URL=postgresql://user:password@host/db?sslmode=require

# JWT
STUDENT_JWT_SECRET=<64-char-random-string>
ADMIN_JWT_SECRET=<64-char-random-string>

# OTP
OTP_EXPIRY_MINUTES=15
OTP_LENGTH=6

# Mail (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=career.internshipwala@gmail.com
SMTP_PASS=<app-password>
MAIL_FROM="InternshipWala <career.internshipwala@gmail.com>"

# File Upload
UPLOAD_DIR=uploads
MAX_PROFILE_PHOTO_SIZE_MB=2
MAX_PROJECT_FILE_SIZE_MB=10

# Rate Limiting
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=20
GLOBAL_RATE_LIMIT_MAX=100

# Hard Copy Fee (fallback if not in DB settings)
DEFAULT_HARD_COPY_FEE=500
```

### 14.2 env.ts Validation

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  STUDENT_JWT_SECRET: z.string().min(32),
  ADMIN_JWT_SECRET: z.string().min(32),
  // ... all other required vars
});

export const env = envSchema.parse(process.env);
// Throws ZodError on startup if any variable is invalid/missing
```

---

## 15. Business Workflows

### 15.1 Student Registration Workflow

```mermaid
flowchart TD
    A[Student submits registration form] --> B{Validate inputs}
    B -- Invalid --> C[Return 400 with field errors]
    B -- Valid --> D{Email already registered?}
    D -- Yes --> E[Return 409 Conflict]
    D -- No --> F{Mobile already registered?}
    F -- Yes --> E
    F -- No --> G[Hash password with bcrypt]
    G --> H[Create user record is_verified=FALSE]
    H --> I[Generate 6-digit OTP]
    I --> J[Store OTP in otp_verifications expires in 15min]
    J --> K[Send OTP via email]
    K --> L[Return 201 with userId]
    L --> M[Student receives OTP email]
    M --> N[Student submits OTP]
    N --> O{OTP valid and not expired?}
    O -- No --> P[Return 401]
    O -- Yes --> Q[Mark OTP is_used=TRUE]
    Q --> R[Set user is_verified=TRUE]
    R --> S[Return 200]
    S --> T[Student can now log in]
```

### 15.2 Course Enrollment Workflow

```mermaid
flowchart TD
    A[Student selects course and duration] --> B{Student authenticated?}
    B -- No --> C[Redirect to login]
    B -- Yes --> D{Course exists and published?}
    D -- No --> E[Return 404]
    D -- Yes --> F{Already enrolled active?}
    F -- Yes --> G[Return 409 Already enrolled]
    F -- No --> H[Create enrollment status=pending]
    H --> I[Create payment record status=pending]
    H --> I
    note1[Both in $transaction]
    I --> J[Return 201 with enrollment and payment details]
    J --> K[Student makes payment offline / gateway]
    K --> L[Admin receives payment notification]
    L --> M[Admin confirms payment in admin panel]
    M --> N[Set payment status=success]
    N --> O[Set enrollment status=active]
    O --> P[Send notification to student]
    P --> Q[Student can access course content]
```

### 15.3 Module Progression and Certificate Workflow

```mermaid
flowchart TD
    A[Student opens course] --> B[Fetch modules with progress]
    B --> C[Module 1 always accessible]
    C --> D[Student completes Module 1]
    D --> E[POST mark module 1 complete]
    E --> F[Upsert module_progress is_completed=TRUE]
    F --> G[Module 2 now unlocked]
    G --> H[...student completes all modules...]
    H --> I{All modules completed?}
    I -- No --> J[Update progress; return progress data]
    I -- Yes --> K[Mark enrollment completed_at=NOW status=completed]
    K --> L[Generate certificate number IW-YYYY-NNNNNN]
    L --> M[Create certificates record admin_approved=FALSE]
    M --> N[Send notification to student]
    N --> O{Admin approval required?}
    O -- Yes --> P[Admin reviews and approves]
    P --> Q[Set admin_approved=TRUE]
    O -- No --> Q
    Q --> R[Certificate PDF generated placeholder v1]
    R --> S[Student downloads certificate from dashboard]
```

### 15.4 Admin Notification Flow

```mermaid
flowchart TD
    A[Triggering event occurs] --> B{Event type?}
    B -- Enrollment created --> C[Notify student: enrollment pending payment]
    B -- Payment confirmed --> D[Notify student: access activated]
    B -- Payment rejected --> E[Notify student: payment rejected]
    B -- Module completed --> F{All modules done?}
    F -- Yes --> G[Notify student: certificate being prepared]
    F -- No --> H[No notification]
    B -- Certificate approved --> I[Notify student: download your certificate]
    C & D & E & G & I --> J[Insert into notifications table]
    J --> K[Optionally send email via MailService]
```

---

## 16. Sequence Diagrams

### 16.1 Apply for Internship (Enrollment)

```mermaid
sequenceDiagram
    participant C as Client
    participant Auth as authenticate middleware
    participant Ctrl as EnrollmentController
    participant ES as EnrollmentService
    participant CR as CourseRepository
    participant ER as EnrollmentRepository
    participant NS as NotificationService
    participant DB as PostgreSQL

    C->>Auth: POST /api/enrollments { Authorization: Bearer token }
    Auth->>DB: SELECT users WHERE id = payload.id
    DB-->>Auth: user
    Auth->>Ctrl: next()
    Ctrl->>ES: enroll(userId, { course_id, duration_fee_id })
    ES->>CR: findById(course_id)
    CR->>DB: SELECT courses WHERE id AND status='published' AND deleted_at IS NULL
    DB-->>CR: course or null
    alt Course not found/not published
        ES-->>Ctrl: AppError(404)
        Ctrl-->>C: 404 Not Found
    end
    ES->>ER: findByUserAndCourse(userId, course_id)
    DB-->>ER: existing enrollment or null
    alt Active enrollment exists
        ES-->>Ctrl: AppError(409)
        Ctrl-->>C: 409 Already enrolled
    end
    ES->>DB: $transaction(createEnrollment + createPayment)
    DB-->>ES: { enrollment, payment }
    ES->>NS: send(userId, 'Enrollment Pending', '...', 'enrollment')
    NS->>DB: INSERT notifications
    ES-->>Ctrl: { enrollment, payment }
    Ctrl-->>C: 201 { data: { enrollment, payment } }
```

### 16.2 Admin Payment Confirmation

```mermaid
sequenceDiagram
    participant A as Admin Client
    participant Auth as authenticateAdmin
    participant Perm as authorizePermission
    participant Ctrl as PaymentController
    participant PS as PaymentService
    participant PR as PaymentRepository
    participant ER as EnrollmentRepository
    participant NS as NotificationService
    participant DB as PostgreSQL

    A->>Auth: PATCH /api/admin/payments/:id/confirm
    Auth->>DB: SELECT admin_users WHERE id = payload.id
    DB-->>Auth: admin with roles/permissions
    Auth->>Perm: check manage_payments permission
    Perm->>Ctrl: next()
    Ctrl->>PS: confirmPayment(adminId, paymentId, txnId)
    PS->>PR: findById(paymentId)
    PR->>DB: SELECT payments
    DB-->>PR: payment with enrollment
    PS->>DB: $transaction(updatePayment + updateEnrollment + logActivity)
    DB-->>PS: confirmed
    PS->>NS: send(enrollment.user_id, 'Course Access Activated', ...)
    NS->>DB: INSERT notifications
    PS-->>Ctrl: { payment }
    Ctrl-->>A: 200 { data: { payment } }
```

### 16.3 Resume / Project Upload

```mermaid
sequenceDiagram
    participant C as Client
    participant MW as uploadMiddleware (Multer)
    participant Auth as authenticate
    participant Ctrl as EnrollmentController
    participant ES as EnrollmentService
    participant DB as PostgreSQL
    participant FS as File System

    C->>MW: POST /api/enrollments/:id/assignments/:assignId/submit multipart/form-data
    MW->>MW: validate MIME type and file size
    alt Invalid file
        MW-->>C: 400 Invalid file type or size
    end
    MW->>FS: Save to uploads/assignments/{filename}
    FS-->>MW: file saved
    MW->>Auth: next()
    Auth->>DB: verify token
    Auth->>Ctrl: next()
    Ctrl->>ES: submitAssignment(userId, enrollmentId, assignmentId, { file_url, answer_text })
    ES->>DB: SELECT enrollments WHERE id = enrollmentId AND user_id = userId AND status='active'
    alt Not authorized or not active
        ES-->>Ctrl: AppError(403)
    end
    ES->>DB: UPSERT assignment_submissions
    DB-->>ES: submission
    ES-->>Ctrl: { submission }
    Ctrl-->>C: 201 { data: { submission } }
```

---

## 17. Coding Standards

### 17.1 Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files | `kebab-case.ts` | `auth.service.ts` |
| Classes | `PascalCase` | `AuthService` |
| Functions / methods | `camelCase` | `findByEmail()` |
| Variables | `camelCase` | `hashedPassword` |
| Constants | `UPPER_SNAKE_CASE` | `JWT_EXPIRY` |
| Interfaces | `PascalCase` prefixed with `I` (optional) or descriptive | `RegisterDto`, `PaginatedResult` |
| Routes | `kebab-case` | `/api/board-members` |
| Database columns | `snake_case` (mirrors DB schema) | `full_name`, `created_at` |

### 17.2 Folder Rules

- One file per class/service/repository
- No circular imports — dependency direction is always: route → controller → service → repository → prisma
- Never import a controller from a service
- Never import a repository from a controller

### 17.3 Controller Rules

- Controllers contain zero business logic
- Controllers only: parse req, call one service method, call `sendSuccess` or `next(error)`
- No database imports in controllers
- No direct Prisma calls in controllers

```typescript
// CORRECT
async login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await this.authService.login(req.body);
    return sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    return next(error);
  }
}

// WRONG — business logic in controller
async login(req: Request, res: Response) {
  const user = await prisma.users.findUnique(...); // ← NEVER
  const match = await bcrypt.compare(...);          // ← NEVER
}
```

### 17.4 Service Layer Rules

- Services contain all business logic
- Services may call other services (injection, not direct import of repository)
- Services may call the repository layer
- Services never access `req`, `res`, or `next`
- Throw `AppError` for all handled error cases — never return error objects

### 17.5 Repository Rules

- Repositories only call Prisma — no business logic, no HTTP concerns
- All queries that target soft-deletable entities MUST include `deleted_at: null` in `where` unless explicitly querying historical records
- Return `null` (not throw) for single-record queries that find nothing (`findFirst`, `findUnique`)
- Return empty array for list queries that find nothing

### 17.6 Error Handling Rules

- Use `try/catch` with `next(error)` in all async controllers
- Throw `AppError` in services for all expected failure conditions
- Never swallow errors silently — always log unexpected errors before re-throwing
- In repositories, let Prisma errors bubble up unmodified — the global error handler maps them

### 17.7 Dependency Injection

Services are instantiated with their repository dependencies injected via constructor. No service instantiates its own repository.

```typescript
// src/services/auth.service.ts
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly otpRepo: OtpRepository,
    private readonly mailService: MailService
  ) {}
}

// src/routes/auth.routes.ts
const userRepo = new UserRepository();
const otpRepo = new OtpRepository();
const mailService = new MailService();
const authService = new AuthService(userRepo, otpRepo, mailService);
const authController = new AuthController(authService);
```

---

## 18. AI Implementation Guide

This section specifies exactly how an AI coding assistant should implement each module.

### 18.0 Global Implementation Prerequisites

**Step 0 — Before writing any module code:**

1. Initialize Node.js project: `npm init -y`
2. Install all dependencies (see list below)
3. Configure `tsconfig.json` with `strict: true`, `esModuleInterop: true`, `outDir: dist`, `rootDir: src`
4. Write `prisma/schema.prisma` — define ALL 40 tables from the v1.1 database design document exactly as specified
5. Run `npx prisma generate` to generate the Prisma Client
6. Write `src/config/env.ts` and validate all required env vars with Zod
7. Write `src/config/database.ts` — Prisma singleton
8. Write `src/utils/AppError.ts` — custom error class
9. Write `src/utils/response.ts` — `sendSuccess()` and `sendError()` helpers
10. Write `src/logger/winston.ts`
11. Write `src/middlewares/errorHandler.ts`
12. Write `src/middlewares/security.ts`
13. Write `src/middlewares/rateLimiter.ts`
14. Write `src/middlewares/requestLogger.ts`
15. Write `src/app.ts` — apply all global middleware
16. Write `server.ts` — start HTTP server and cron jobs

**Required npm packages:**
```
express
prisma @prisma/client
zod
jsonwebtoken
bcrypt
multer
nodemailer
helmet
cors
hpp
xss-clean
express-rate-limit
node-cron
winston
uuid

@types/express @types/node @types/jsonwebtoken @types/bcrypt @types/multer @types/nodemailer @types/cors @types/hpp @types/uuid
typescript ts-node nodemon
```

---

### 18.1 Module 1: Authentication

**Implementation Order:** Implement FIRST — all other modules depend on auth.

**Files to Create:**

| File | Location |
|------|----------|
| `auth.validator.ts` | `src/validators/` |
| `otp.repository.ts` | `src/repositories/` |
| `user.repository.ts` | `src/repositories/` |
| `mail.service.ts` | `src/services/` |
| `auth.service.ts` | `src/services/` |
| `auth.controller.ts` | `src/controllers/` |
| `authenticate.ts` | `src/middlewares/` |
| `auth.routes.ts` | `src/routes/` |

**Implementation Steps:**

1. **`otp.repository.ts`** — Write `create`, `findValid`, `markUsed`, `invalidateOld`, `deleteExpired` using Prisma `otp_verifications` model
2. **`user.repository.ts`** — Write all methods listed in Section 6.1
3. **`mail.service.ts`** — Configure Nodemailer; write `sendOtp`, `sendWelcome`, `sendPasswordReset` using HTML email templates. All send methods must be wrapped in try/catch; errors logged but not thrown
4. **`auth.service.ts`** — Implement all methods from Section 5.1. Use `prisma.$transaction` for `verifyOtp` and `resetPassword`
5. **`auth.controller.ts`** — Wire controller methods to service; use `sendSuccess`/`next(error)` pattern
6. **`authenticate.ts`** / **`authenticateAdmin.ts`** — Implement JWT verification as specified in Section 7.1
7. **`auth.routes.ts`** — Mount all auth routes; apply `authLimiter` and `otpLimiter`
8. **Mount in `routes/index.ts`:** `router.use('/auth', authRouter)`

**Database Tables:** `users`, `otp_verifications`

**Common Pitfalls:**
- Do NOT return different error messages for wrong email vs wrong password — always return `'Invalid credentials'` to prevent user enumeration
- OTP comparison must be exact string match AND `is_used = FALSE` AND `expires_at > NOW()`
- `forgotPassword` must always return 200 even if email is not found (prevent user enumeration)
- Hash password with bcrypt cost 12 — not 10 (performance vs security balance for this scale)
- Admin login endpoint must use `ADMIN_JWT_SECRET`, not `STUDENT_JWT_SECRET`

**APIs Produced:**

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/register` | None |
| POST | `/api/auth/verify-otp` | None |
| POST | `/api/auth/resend-otp` | None |
| POST | `/api/auth/login` | None |
| POST | `/api/auth/admin/login` | None |
| POST | `/api/auth/forgot-password` | None |
| POST | `/api/auth/reset-password` | None |
| PUT | `/api/auth/change-password` | Student JWT |

---

### 18.2 Module 2: User Profile

**Depends on:** Module 1 (authenticate middleware)

**Files to Create:**

| File | Location |
|------|----------|
| `user.validator.ts` | `src/validators/` |
| `user.service.ts` | `src/services/` |
| `user.controller.ts` | `src/controllers/` |
| `uploadMiddleware.ts` | `src/middlewares/` |
| `user.routes.ts` | `src/routes/` |

**Implementation Steps:**

1. **`upload.ts`** (config) — Configure Multer diskStorage with naming convention from Section 10.2; write file filter for profile photos
2. **`uploadMiddleware.ts`** — Export `uploadProfilePhoto = multer(...).single('profile_photo')`
3. **`user.service.ts`** — `getProfile(userId)`, `updateProfile(userId, dto)`, `updateProfilePhoto(userId, filePath)`
4. **`user.controller.ts`** — parse body; call service; for photo upload, pass `req.file.path` to service
5. **`user.routes.ts`** — Apply `authenticate` to all routes; apply `uploadProfilePhoto` only to the photo route

**Common Pitfalls:**
- After file upload, if the service throws (e.g., user not found), delete the uploaded file to prevent orphan files
- Never trust `req.file.mimetype` alone — also validate file extension in fileFilter
- Update `profile_photo_url` in DB to the relative URL path, not the absolute filesystem path

**APIs Produced:**

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/user/profile` | Student JWT |
| PUT | `/api/user/profile` | Student JWT |
| POST | `/api/user/profile/photo` | Student JWT |

---

### 18.3 Module 3: Admin

**Depends on:** Module 1 (authenticateAdmin, authorizePermission)

**Files to Create:**

| File | Location |
|------|----------|
| `admin.repository.ts` | `src/repositories/` |
| `activityLog.repository.ts` | `src/repositories/` |
| `admin.service.ts` | `src/services/` |
| `admin.controller.ts` | `src/controllers/` |
| `authenticateAdmin.ts` | `src/middlewares/` |
| `authorizePermission.ts` | `src/middlewares/` |
| `admin/index.ts` | `src/routes/admin/` |

**Implementation Steps:**

1. **`activityLog.repository.ts`** — Write `create(data)` method. Called by services after sensitive admin operations
2. **`admin.repository.ts`** — `findById`, `findByEmail`, `create`, `update`, `softDelete`, `listAdmins`, `assignRole`, `removeRole`
3. **`authenticateAdmin.ts`** — Implement as specified in Section 7.1; load admin with roles and permissions
4. **`authorizePermission.ts`** — Implement as specified in Section 7.2
5. **`admin.service.ts`** — `createAdmin`, `updateAdmin`, `deactivateAdmin` (sets `deleted_at`), `listAdmins`, `assignRole`, `getActivityLogs`
6. Mount admin router at `/api/admin` in `routes/index.ts`; ALL routes under this path require `authenticateAdmin`

**Common Pitfalls:**
- Admin deactivation MUST use soft delete (`deleted_at = NOW()`) — never hard delete
- The `activity_logs` table references `admin_user_id` with `ON DELETE RESTRICT` — this enforces the soft-delete-only policy at DB level
- Super admin role bypasses all `authorizePermission` checks — implement this in `authorizePermission.ts`

**APIs Produced:**

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/admin/admins` | Admin JWT |
| POST | `/api/admin/admins` | Admin JWT + super_admin |
| PUT | `/api/admin/admins/:id` | Admin JWT + super_admin |
| DELETE | `/api/admin/admins/:id` | Admin JWT + super_admin |
| GET | `/api/admin/activity-logs` | Admin JWT |

---

### 18.4 Module 4: Courses

**Depends on:** Modules 1, 3

**Files to Create:**

| File | Location |
|------|----------|
| `course.validator.ts` | `src/validators/` |
| `course.repository.ts` | `src/repositories/` |
| `course.service.ts` | `src/services/` |
| `course.controller.ts` | `src/controllers/` |
| `courses.routes.ts` | `src/routes/` |
| `admin/courses.routes.ts` | `src/routes/admin/` |

**Database Tables:** `course_categories`, `courses`, `course_duration_fees`, `course_modules`, `assignments`

**Implementation Steps:**

1. **`course.repository.ts`** — All methods from Section 6.3. For `listPublished`, apply `status: 'published'` and `deleted_at: null` filters always
2. **`course.service.ts`** — `listPublic`, `getDetail`, `listCategories`, `create`, `update`, `softDelete`, `publish`, `addModule`, `updateModule`, `deleteModule`, `addDurationFee`
3. **`course.controller.ts`** — Wire all methods
4. **Public routes** at `/api/courses` — no auth
5. **Admin routes** at `/api/admin/courses` — require `authenticateAdmin` + `authorizePermission('manage_courses')`

**Common Pitfalls:**
- `softDelete` must check for active enrollments before setting `deleted_at`
- Module `module_no` uniqueness is enforced by DB constraint `UNIQUE (course_id, module_no)` — catch Prisma P2002 and return a clear 409 message
- Public listing must NEVER return `draft` or `archived` courses regardless of any query parameter

**APIs Produced:**

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/courses` | None |
| GET | `/api/courses/categories` | None |
| GET | `/api/courses/:id` | None |
| POST | `/api/admin/courses` | Admin |
| PUT | `/api/admin/courses/:id` | Admin |
| DELETE | `/api/admin/courses/:id` | Admin |
| PATCH | `/api/admin/courses/:id/publish` | Admin |
| POST | `/api/admin/courses/:id/modules` | Admin |
| PUT | `/api/admin/courses/:id/modules/:moduleId` | Admin |
| DELETE | `/api/admin/courses/:id/modules/:moduleId` | Admin |
| POST | `/api/admin/courses/:id/duration-fees` | Admin |
| GET | `/api/admin/courses` | Admin |

---

### 18.5 Module 5: Enrollment

**Depends on:** Modules 1, 4

**Files to Create:**

| File | Location |
|------|----------|
| `enrollment.validator.ts` | `src/validators/` |
| `enrollment.repository.ts` | `src/repositories/` |
| `moduleProgress.repository.ts` | `src/repositories/` |
| `enrollment.service.ts` | `src/services/` |
| `enrollment.controller.ts` | `src/controllers/` |
| `enrollment.routes.ts` | `src/routes/` |
| `admin/enrollments.routes.ts` | `src/routes/admin/` |

**Critical Implementation Notes:**

1. **Atomicity:** `enroll()` in `enrollment.repository.ts` MUST use `prisma.$transaction([createEnrollment, createPayment])`. If either fails, both roll back
2. **Module Gating:** In `getModulesWithProgress`, return module list with the `is_accessible` flag computed as: module 1 is always accessible; module N is accessible if module N-1 has `is_completed=TRUE` in `module_progress`
3. **Completion Detection:** In `markModuleComplete`, after upserting progress, count total modules for the course vs count of completed modules for this enrollment. If equal → call `certificateService.generateCertificate(enrollmentId)`
4. **`uq_active_enrollment`** partial index: handled at DB level. The service must catch Prisma P2002 on enrollment creation and return 409 "Already enrolled in this course"

**APIs Produced:**

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/enrollments` | Student JWT |
| GET | `/api/enrollments/mine` | Student JWT |
| GET | `/api/enrollments/:id/modules` | Student JWT |
| POST | `/api/enrollments/:id/modules/:moduleId/complete` | Student JWT |
| POST | `/api/enrollments/:id/assignments/:assignmentId/submit` | Student JWT |
| GET | `/api/admin/enrollments` | Admin |
| PATCH | `/api/admin/enrollments/:id/activate` | Admin |
| PATCH | `/api/admin/enrollments/:id/cancel` | Admin |

---

### 18.6 Module 6: Payments

**Depends on:** Modules 1, 3, 5

**Files to Create:**

| File | Location |
|------|----------|
| `payment.validator.ts` | `src/validators/` |
| `payment.repository.ts` | `src/repositories/` |
| `payment.service.ts` | `src/services/` |
| `payment.controller.ts` | `src/controllers/` |
| `admin/payments.routes.ts` | `src/routes/admin/` |

**Critical Implementation Note:** Gateway integration is OUT OF SCOPE for v1. All payment confirmation is manual by admin. Do NOT attempt to integrate Razorpay in v1.

**APIs Produced:**

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/payments/mine` | Student JWT |
| GET | `/api/admin/payments` | Admin |
| PATCH | `/api/admin/payments/:id/confirm` | Admin |
| PATCH | `/api/admin/payments/:id/reject` | Admin |
| POST | `/api/admin/payments/:id/refund` | Admin |

---

### 18.7 Module 7: Certificates

**Depends on:** Modules 1, 3, 5, 6

**Files to Create:**

| File | Location |
|------|----------|
| `certificate.validator.ts` | `src/validators/` |
| `certificate.repository.ts` | `src/repositories/` |
| `certificate.service.ts` | `src/services/` |
| `certificate.controller.ts` | `src/controllers/` |
| `admin/certificates.routes.ts` | `src/routes/admin/` |

**Certificate Number Generation — exact algorithm:**

```typescript
async generateCertNumber(): Promise<string> {
  const year = new Date().getFullYear();
  // Find the highest existing sequence for this year
  const latest = await prisma.$queryRaw<[{cert_number: string}]>`
    SELECT cert_number FROM certificates
    WHERE cert_number LIKE ${`IW-${year}-%`}
    ORDER BY cert_number DESC
    LIMIT 1
  `;
  let sequence = 1;
  if (latest.length > 0) {
    sequence = parseInt(latest[0].cert_number.split('-')[2]) + 1;
  }
  return `IW-${year}-${String(sequence).padStart(6, '0')}`;
}
```

**Public Verification Endpoint:** `GET /api/certificates/verify/:cert_number` — no auth required. Used for external verification of certificate authenticity.

**APIs Produced:**

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/certificates/mine` | Student JWT |
| GET | `/api/certificates/:id/download` | Student JWT |
| GET | `/api/certificates/verify/:cert_number` | None |
| POST | `/api/certificates/:id/hard-copy` | Student JWT |
| GET | `/api/admin/certificates` | Admin |
| PATCH | `/api/admin/certificates/:id/approve` | Admin |
| PATCH | `/api/admin/certificates/hard-copy/:requestId` | Admin |

---

### 18.8 Module 8: Dashboard

**Depends on:** All modules (reads from all tables)

**Files to Create:**

| File | Location |
|------|----------|
| `dashboard.repository.ts` | `src/repositories/` |
| `dashboard.service.ts` | `src/services/` |
| `dashboard.controller.ts` | `src/controllers/` |
| `admin/dashboard.routes.ts` | `src/routes/admin/` |

**Implementation Note:** Use `Promise.all()` to run all COUNT/SUM queries in parallel for minimal response time.

**API:** `GET /api/admin/dashboard` — Admin JWT required

---

### 18.9 Module 9: Blog

**Files to Create:**

| File | Location |
|------|----------|
| `blog.validator.ts` | `src/validators/` |
| `blog.repository.ts` | `src/repositories/` |
| `blog.service.ts` | `src/services/` |
| `blog.controller.ts` | `src/controllers/` |
| `blog.routes.ts` | `src/routes/` |
| `admin/blog.routes.ts` | `src/routes/admin/` |

**APIs Produced:**

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/blog` | None |
| GET | `/api/blog/:slug` | None |
| GET | `/api/blog/categories` | None |
| POST | `/api/admin/blog` | Admin |
| PUT | `/api/admin/blog/:id` | Admin |
| DELETE | `/api/admin/blog/:id` | Admin |
| POST | `/api/admin/blog/categories` | Admin |

---

### 18.10 Module 10: Jobs

**Files to Create:**

| File | Location |
|------|----------|
| `job.validator.ts` | `src/validators/` |
| `job.repository.ts` | `src/repositories/` |
| `job.service.ts` | `src/services/` |
| `job.controller.ts` | `src/controllers/` |
| `jobs.routes.ts` | `src/routes/` |
| `admin/jobs.routes.ts` | `src/routes/admin/` |

**APIs Produced:**

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/jobs` | None |
| GET | `/api/jobs/:id` | None |
| POST | `/api/jobs/:id/apply` | Student JWT |
| GET | `/api/admin/jobs` | Admin |
| POST | `/api/admin/jobs` | Admin |
| PUT | `/api/admin/jobs/:id` | Admin |
| DELETE | `/api/admin/jobs/:id` | Admin |
| GET | `/api/admin/jobs/:id/applicants` | Admin |

---

### 18.11 Module 11: CMS (Content Management)

**Files to Create:**

| File | Location |
|------|----------|
| `cms.validator.ts` | `src/validators/` |
| `cms.repository.ts` | `src/repositories/` |
| `cms.service.ts` | `src/services/` |
| `cms.controller.ts` | `src/controllers/` |
| `public.routes.ts` | `src/routes/` |
| `admin/cms.routes.ts` | `src/routes/admin/` |

**Public APIs (no auth):**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/public/carousel` | Active carousel slides ordered by display_order |
| GET | `/api/public/testimonials` | Active testimonials |
| GET | `/api/public/board-members` | Searchable/paginated board members |
| GET | `/api/public/events` | Active events |
| GET | `/api/public/video-gallery` | Active videos ordered by display_order |
| GET | `/api/public/announcements` | Active announcements |
| GET | `/api/pages/:slug` | CMS page by slug |
| POST | `/api/contact` | Submit contact form |

**Admin APIs:**

| Method | Path | Description |
|--------|------|-------------|
| POST/PUT/DELETE | `/api/admin/cms/carousel` | CRUD carousel slides |
| POST/PUT/DELETE | `/api/admin/cms/testimonials` | CRUD testimonials |
| POST/PUT/DELETE | `/api/admin/cms/board-members` | CRUD board members |
| POST/PUT/DELETE | `/api/admin/cms/pages` | CRUD static pages |
| POST/PUT/DELETE | `/api/admin/cms/announcements` | CRUD announcements |
| GET | `/api/admin/contact` | List contact messages |
| PATCH | `/api/admin/contact/:id` | Update message status/reply |
| GET/POST/PUT/DELETE | `/api/admin/settings` | Platform settings |

---

### 18.12 Module 12: Notifications

**Files to Create:**

| File | Location |
|------|----------|
| `notification.repository.ts` | `src/repositories/` |
| `notification.service.ts` | `src/services/` |
| `notification.controller.ts` | `src/controllers/` |

`NotificationService` is consumed by: EnrollmentService, PaymentService, CertificateService. It is not instantiated in isolation — inject it as a dependency.

**APIs:**

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/notifications` | Student JWT |
| PATCH | `/api/notifications/:id/read` | Student JWT |
| PATCH | `/api/notifications/read-all` | Student JWT |
| POST | `/api/admin/notifications/send` | Admin (bulk send) |

---

### 18.13 Module 13: Collaborations

**Files to Create:**

| File | Location |
|------|----------|
| `collaboration.validator.ts` | `src/validators/` |
| `collaboration.repository.ts` | `src/repositories/` |
| `collaboration.service.ts` | `src/services/` |
| `collaboration.controller.ts` | `src/controllers/` |
| `admin/collaborations.routes.ts` | `src/routes/admin/` |

**APIs:**

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/student-chapters` | None |
| POST | `/api/institution-collaborations` | None |
| POST | `/api/industry-academia` | None |
| GET | `/api/admin/student-chapters` | Admin |
| PATCH | `/api/admin/student-chapters/:id/status` | Admin |
| GET | `/api/admin/institution-collaborations` | Admin |
| PATCH | `/api/admin/institution-collaborations/:id/status` | Admin |
| GET | `/api/admin/industry-academia` | Admin |
| PATCH | `/api/admin/industry-academia/:id/status` | Admin |

---

### 18.14 OTP Cleanup Cron Job

**File:** `src/jobs/otpCleanup.job.ts`

```typescript
import cron from 'node-cron';
import { OtpRepository } from '../repositories/otp.repository';
import logger from '../logger/winston';

export function startOtpCleanupJob() {
  const otpRepo = new OtpRepository();
  cron.schedule('*/30 * * * *', async () => {
    try {
      await otpRepo.deleteExpired();
      logger.info('OTP cleanup job ran successfully');
    } catch (error) {
      logger.error('OTP cleanup job failed', { error });
    }
  });
}
```

Call `startOtpCleanupJob()` from `server.ts` after the HTTP server starts.

---

### 18.15 Implementation Order (Complete)

Implement modules in this exact order to respect dependencies:

| Step | Module | Reason |
|------|--------|--------|
| 1 | Prisma schema + env + app skeleton | Foundation — everything depends on this |
| 2 | Authentication | All protected routes depend on auth middleware |
| 3 | Admin account + RBAC middleware | Required before any admin routes |
| 4 | User profile | Basic user-facing feature |
| 5 | Courses (public + admin) | Required by enrollment |
| 6 | Enrollment | Required by payments and certificates |
| 7 | Payments | Required by certificates |
| 8 | Certificates | Depends on enrollment and payment |
| 9 | Dashboard | Reads from all tables — implement last |
| 10 | Notifications | Can be wired into enrollment/payment as implemented |
| 11 | Blog | Standalone CMS feature |
| 12 | Jobs | Standalone job listing feature |
| 13 | CMS / Public content | Homepage and static content |
| 14 | Collaborations | Form submission features |
| 15 | OTP cleanup cron | Final operational feature |

---

### 18.16 Common Pitfalls and Implementation Notes

| Pitfall | Correct Approach |
|---------|-----------------|
| Importing PrismaClient in multiple files | Use singleton from `src/config/database.ts` |
| Raw `DELETE` from soft-deletable tables | Always use `update({ data: { deleted_at: new Date() } })` |
| Not filtering `deleted_at IS NULL` in queries | Add `deleted_at: null` to every Prisma `where` on soft-deletable models |
| Exposing password_hash in API responses | Use `Prisma.UserSelect` to explicitly exclude `password_hash` |
| Not wrapping enrollment+payment in transaction | Always use `$transaction` for enrollment creation |
| Module access without sequential check | Implement module gating in `getModulesWithProgress` — compute `is_accessible` flag |
| `UNIQUE` constraint on enrollment | DB uses partial index `uq_active_enrollment` — catch P2002 with a clear message |
| Admin hard delete | Admin deactivation = soft delete only — enforce in service layer |
| Hardcoded secrets | All secrets in `.env`; validated in `env.ts` on startup |
| OTP timing attack | Use `bcrypt.compare`-style constant-time comparison — though for 6-digit numeric OTP, direct string match is acceptable as OTPs are already rate-limited |
| Re-enrolling after cancellation | Correctly handled by partial unique index — service must not block this |
| Certificate number race condition | DB `UNIQUE (cert_number)` constraint is the safety net; retry logic handles the rare collision |
| Missing `authorizePermission` on admin routes | Every admin write endpoint must have both `authenticateAdmin` AND `authorizePermission` |

---

## Appendix: Prisma Schema Excerpt (Key Models)

The following is a representative excerpt. The full Prisma schema must define all 40 tables from the v1.1 database design document.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ENUMs
enum CourseType     { online offline industrial }
enum CourseStatus   { draft published archived }
enum EnrollmentStatus { pending active completed cancelled }
enum PaymentStatus  { pending success failed refunded }
enum RefundStatus   { pending processed failed }
enum HardcopyStatus { pending dispatched delivered }
enum AssignmentType { quiz assignment project exercise }
enum SubmissionStatus { submitted reviewed passed failed }
enum JobListingType { internship job teaching corporate overseas }
enum ApplicationStatus { applied reviewed shortlisted rejected }
enum CollabStatus   { pending approved rejected }
enum ContentStatus  { draft published archived }
enum ContactStatus  { unread read replied closed }

model users {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  full_name         String    @db.VarChar(150)
  email             String    @unique @db.VarChar(200)
  mobile            String    @unique @db.VarChar(15)
  password_hash     String    @db.VarChar(255)
  profile_photo_url String?   @db.Text
  dob               DateTime? @db.Date
  address           String?   @db.Text
  city              String?   @db.VarChar(100)
  state             String?   @db.VarChar(100)
  country           String    @default("India") @db.VarChar(100)
  father_name       String?   @db.VarChar(150)
  present_course    String?   @db.VarChar(100)
  branch            String?   @db.VarChar(100)
  year_qualifying   String?   @db.VarChar(10)
  college_name      String?   @db.VarChar(200)
  referral_code     String?   @db.VarChar(50)
  is_verified       Boolean   @default(false)
  is_active         Boolean   @default(true)
  last_login_at     DateTime? @db.Timestamptz
  created_at        DateTime  @default(now()) @db.Timestamptz
  updated_at        DateTime  @default(now()) @updatedAt @db.Timestamptz
  deleted_at        DateTime? @db.Timestamptz

  enrollments              enrollments[]
  payments                 payments[]
  certificates             certificates[]
  notifications            notifications[]
  job_applications         job_applications[]
  study_abroad_applications study_abroad_applications[]

  @@map("users")
}

model enrollments {
  id              String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id         String           @db.Uuid
  course_id       String           @db.Uuid
  duration_fee_id String           @db.Uuid
  fee_paid        Decimal          @db.Decimal(10, 2)
  status          EnrollmentStatus @default(pending)
  enrolled_at     DateTime         @default(now()) @db.Timestamptz
  completed_at    DateTime?        @db.Timestamptz
  updated_at      DateTime         @default(now()) @updatedAt @db.Timestamptz
  deleted_at      DateTime?        @db.Timestamptz

  user           users                  @relation(fields: [user_id], references: [id])
  course         courses                @relation(fields: [course_id], references: [id])
  duration_fee   course_duration_fees   @relation(fields: [duration_fee_id], references: [id])
  payment        payments?
  certificate    certificates?
  module_progress module_progress[]
  submissions    assignment_submissions[]

  // Note: uq_active_enrollment partial unique index must be created via migration SQL:
  // CREATE UNIQUE INDEX uq_active_enrollment ON enrollments (user_id, course_id)
  // WHERE deleted_at IS NULL AND status != 'cancelled';
  @@map("enrollments")
}

// ... (all remaining 38 models follow the same pattern)
```

> **Implementation Note for AI:** The full Prisma schema must include all 40 models from the v1.1 database design document. After generating the schema, run `npx prisma migrate dev --name init` to create the initial migration. Then add the `uq_active_enrollment` partial unique index to the migration SQL file manually before applying it.

---

*Specification End*

*InternshipWala Backend Architecture & AI Implementation Specification v1.0*
*Company: Cloudtechz InternshipWALA Private Limited*
*Stack: Node.js · Express.js · PostgreSQL · Prisma ORM · JWT · bcrypt · Multer · Winston*
*Deployment: Render / Railway*
*Date: June 28, 2026*
