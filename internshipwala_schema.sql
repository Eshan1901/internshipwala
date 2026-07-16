-- ═══════════════════════════════════════════════════════════════════
-- InternshipWala — Full Schema Rebuild Script
-- Source: InternshipWala Database Design Document v1.1 (Production-Ready)
-- This script is safe to run on a fresh/empty database, or to wipe
-- and rebuild an existing internshipDB from scratch.
-- ═══════════════════════════════════════════════════════════════════

-- ── STEP 1: CLEAN SLATE ────────────────────────────────────────────
-- Drops all tables (if they exist) and all custom enum types so the
-- rebuild below never collides with anything you built earlier.

DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS cms_pages CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS study_abroad_applications CASCADE;
DROP TABLE IF EXISTS study_abroad_programs CASCADE;
DROP TABLE IF EXISTS online_projects CASCADE;
DROP TABLE IF EXISTS video_gallery CASCADE;
DROP TABLE IF EXISTS industry_academia_collaborations CASCADE;
DROP TABLE IF EXISTS institution_collaborations CASCADE;
DROP TABLE IF EXISTS student_chapters CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS blog_categories CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS carousel_slides CASCADE;
DROP TABLE IF EXISTS board_members CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS job_listings CASCADE;
DROP TABLE IF EXISTS certificate_hard_copy_requests CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS assignment_submissions CASCADE;
DROP TABLE IF EXISTS module_progress CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS course_duration_fees CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS course_categories CASCADE;
DROP TABLE IF EXISTS otp_verifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admin_user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

DROP TYPE IF EXISTS course_type CASCADE;
DROP TYPE IF EXISTS course_status CASCADE;
DROP TYPE IF EXISTS content_status CASCADE;
DROP TYPE IF EXISTS enrollment_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS refund_status CASCADE;
DROP TYPE IF EXISTS hardcopy_status CASCADE;
DROP TYPE IF EXISTS assignment_type CASCADE;
DROP TYPE IF EXISTS submission_status CASCADE;
DROP TYPE IF EXISTS job_listing_type CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS collab_status CASCADE;
DROP TYPE IF EXISTS contact_status CASCADE;

DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

-- ── STEP 2: REBUILD FROM THE APPROVED v1.1 SCHEMA ──────────────────

-- ═══════════════════════════════════════════════════════════════════
-- InternshipWala — PostgreSQL Schema v1.1 (Production-Ready)
-- Platform: https://www.internshipwala.com
-- Stack:    Neon PostgreSQL · Node.js · Express.js · JWT
-- Updated:  June 28, 2026 — Applied all review panel corrections
-- ═══════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUM TYPES ──────────────────────────────────────────────────────

CREATE TYPE course_type         AS ENUM ('online', 'offline', 'industrial');
CREATE TYPE course_status       AS ENUM ('draft', 'published', 'archived');
CREATE TYPE content_status      AS ENUM ('draft', 'published', 'archived');
CREATE TYPE enrollment_status   AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE payment_status      AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE refund_status       AS ENUM ('pending', 'processed', 'failed');
CREATE TYPE hardcopy_status     AS ENUM ('pending', 'dispatched', 'delivered');
CREATE TYPE assignment_type     AS ENUM ('quiz', 'assignment', 'project', 'exercise');
CREATE TYPE submission_status   AS ENUM ('submitted', 'reviewed', 'passed', 'failed');
CREATE TYPE job_listing_type    AS ENUM ('internship', 'job', 'teaching', 'corporate', 'overseas');
CREATE TYPE application_status  AS ENUM ('applied', 'reviewed', 'shortlisted', 'rejected');
CREATE TYPE collab_status       AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE contact_status      AS ENUM ('unread', 'read', 'replied', 'closed');

-- ── UPDATED_AT TRIGGER FUNCTION ──────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── ADMIN USERS ───────────────────────────────────────────────────────
-- NOTE: Never hard-delete admin_users. Use soft delete (deleted_at).
-- activity_logs references this table with ON DELETE RESTRICT.

CREATE TABLE admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(200) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,                        -- v1.1: soft delete (CRITICAL-2 fix)
  CONSTRAINT uq_admin_users_email UNIQUE (email)
);
CREATE TRIGGER trg_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_admin_users_email      ON admin_users (email);
CREATE INDEX idx_admin_users_deleted_at ON admin_users (deleted_at);

-- ── ROLES & PERMISSIONS ───────────────────────────────────────────────

CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(50) NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_roles_name UNIQUE (name)
);

CREATE TABLE permissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  module     VARCHAR(50) NOT NULL,
  action     VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_permissions_module_action UNIQUE (module, action)
);

CREATE TABLE role_permissions (
  role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE admin_user_roles (
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (admin_user_id, role_id)
);

-- ── USERS (STUDENTS) ──────────────────────────────────────────────────

CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         VARCHAR(150) NOT NULL,
  email             VARCHAR(200) NOT NULL,
  mobile            VARCHAR(15)  NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  profile_photo_url TEXT,
  dob               DATE,
  address           TEXT,
  city              VARCHAR(100),
  state             VARCHAR(100),
  country           VARCHAR(100) NOT NULL DEFAULT 'India',
  father_name       VARCHAR(150),
  present_course    VARCHAR(100),
  branch            VARCHAR(100),
  year_qualifying   VARCHAR(10),
  college_name      VARCHAR(200),
  referral_code     VARCHAR(50),
  is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  CONSTRAINT uq_users_email  UNIQUE (email),
  CONSTRAINT uq_users_mobile UNIQUE (mobile)
);
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_users_email          ON users (email);
CREATE INDEX idx_users_mobile         ON users (mobile);
CREATE INDEX idx_users_active_deleted ON users (is_active, deleted_at);

-- ── OTP VERIFICATIONS ─────────────────────────────────────────────────
-- Run cleanup cron: DELETE FROM otp_verifications WHERE expires_at < NOW();

CREATE TABLE otp_verifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target     VARCHAR(200) NOT NULL,
  otp_code   VARCHAR(10)  NOT NULL,
  purpose    VARCHAR(50)  NOT NULL,
  is_used    BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_otp_target_purpose ON otp_verifications (target, purpose);
CREATE INDEX idx_otp_expires_at     ON otp_verifications (expires_at);

-- ── COURSE CATEGORIES ─────────────────────────────────────────────────

CREATE TABLE course_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(120) NOT NULL,
  department    VARCHAR(100),
  icon_url      TEXT,
  colour_code   VARCHAR(10),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_course_categories_slug UNIQUE (slug)
);
CREATE TRIGGER trg_course_categories_updated_at
  BEFORE UPDATE ON course_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_course_categories_slug      ON course_categories (slug);
CREATE INDEX idx_course_categories_is_active ON course_categories (is_active);

-- ── COURSES ───────────────────────────────────────────────────────────

CREATE TABLE courses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id    UUID NOT NULL REFERENCES course_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  created_by     UUID NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  title          VARCHAR(300) NOT NULL,
  description    TEXT,
  type           course_type NOT NULL DEFAULT 'online',
  status         course_status NOT NULL DEFAULT 'draft',
  is_new_badge   BOOLEAN NOT NULL DEFAULT FALSE,
  syllabus       TEXT,
  skills_covered TEXT,
  tools_used     TEXT,
  thumbnail_url  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ
);
CREATE TRIGGER trg_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_courses_category_status ON courses (category_id, status);
CREATE INDEX idx_courses_status_deleted  ON courses (status, deleted_at);
CREATE INDEX idx_courses_active          ON courses (category_id, created_at)
  WHERE deleted_at IS NULL AND status = 'published';

-- ── COURSE DURATION FEES ──────────────────────────────────────────────

CREATE TABLE course_duration_fees (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id      UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
  duration_weeks INTEGER NOT NULL,
  label          VARCHAR(50),
  fee            NUMERIC(10,2) NOT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_cdf_fee      CHECK (fee >= 0),
  CONSTRAINT chk_cdf_duration CHECK (duration_weeks > 0)
);
CREATE INDEX idx_course_duration_fees_course ON course_duration_fees (course_id);

-- ── COURSE MODULES ────────────────────────────────────────────────────

CREATE TABLE course_modules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
  module_no    INTEGER NOT NULL,
  title        VARCHAR(300) NOT NULL,
  description  TEXT,
  content_url  TEXT,
  content_type VARCHAR(20),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_course_modules_no UNIQUE (course_id, module_no)
);
CREATE TRIGGER trg_course_modules_updated_at
  BEFORE UPDATE ON course_modules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_course_modules_course ON course_modules (course_id);

-- ── ASSIGNMENTS ───────────────────────────────────────────────────────

CREATE TABLE assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id     UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE ON UPDATE CASCADE,
  title         VARCHAR(300) NOT NULL,
  description   TEXT,
  type          assignment_type NOT NULL DEFAULT 'assignment',
  max_marks     INTEGER,
  passing_marks INTEGER,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_assignments_max_positive  CHECK (max_marks IS NULL OR max_marks > 0),
  CONSTRAINT chk_assignments_passing_gte_0 CHECK (passing_marks IS NULL OR passing_marks >= 0),
  CONSTRAINT chk_assignments_passing_lte_max
    CHECK (passing_marks IS NULL OR max_marks IS NULL OR passing_marks <= max_marks)
);
CREATE TRIGGER trg_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_assignments_module ON assignments (module_id);

-- ── ENROLLMENTS ───────────────────────────────────────────────────────
-- v1.1: Replaced UNIQUE (user_id, course_id) with a partial index to allow
-- re-enrollment after cancellation (CRITICAL-1 fix).

CREATE TABLE enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  duration_fee_id UUID NOT NULL REFERENCES course_duration_fees(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  fee_paid        NUMERIC(10,2) NOT NULL,
  status          enrollment_status NOT NULL DEFAULT 'pending',
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);
-- Only active (non-cancelled, non-deleted) enrollments are unique per student-course pair.
CREATE UNIQUE INDEX uq_active_enrollment
  ON enrollments (user_id, course_id)
  WHERE deleted_at IS NULL AND status != 'cancelled';
CREATE TRIGGER trg_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_enrollments_user_id     ON enrollments (user_id);
CREATE INDEX idx_enrollments_course_id   ON enrollments (course_id);
CREATE INDEX idx_enrollments_status      ON enrollments (status);
CREATE INDEX idx_enrollments_user_status ON enrollments (user_id, status);

-- ── MODULE PROGRESS ───────────────────────────────────────────────────

CREATE TABLE module_progress (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  module_id        UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE ON UPDATE CASCADE,
  enrollment_id    UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE ON UPDATE CASCADE,
  is_completed     BOOLEAN NOT NULL DEFAULT FALSE,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  completed_at     TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_module_progress    UNIQUE (enrollment_id, module_id),
  CONSTRAINT chk_progress_pct      CHECK (progress_percent BETWEEN 0 AND 100)
);
CREATE TRIGGER trg_module_progress_updated_at
  BEFORE UPDATE ON module_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_module_progress_enrollment ON module_progress (enrollment_id);
CREATE INDEX idx_module_progress_user       ON module_progress (user_id);

-- ── ASSIGNMENT SUBMISSIONS ────────────────────────────────────────────

CREATE TABLE assignment_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE ON UPDATE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE ON UPDATE CASCADE,
  answer_text   TEXT,
  file_url      TEXT,
  score         INTEGER,
  status        submission_status NOT NULL DEFAULT 'submitted',
  feedback      TEXT,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ,
  CONSTRAINT uq_assignment_submission UNIQUE (enrollment_id, assignment_id)
);
CREATE INDEX idx_submissions_enrollment ON assignment_submissions (enrollment_id);
CREATE INDEX idx_submissions_assignment ON assignment_submissions (assignment_id);

-- ── PAYMENTS ─────────────────────────────────────────────────────────

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  enrollment_id   UUID NOT NULL REFERENCES enrollments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  amount          NUMERIC(10,2) NOT NULL,
  currency        VARCHAR(5) NOT NULL DEFAULT 'INR',
  gateway_name    VARCHAR(50),
  gateway_txn_id  VARCHAR(200),
  payment_method  VARCHAR(50),
  status          payment_status NOT NULL DEFAULT 'pending',
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_payment_amount CHECK (amount > 0)
);
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE UNIQUE INDEX idx_payments_gateway_txn ON payments (gateway_txn_id)
  WHERE gateway_txn_id IS NOT NULL;
CREATE INDEX idx_payments_user_id       ON payments (user_id);
CREATE INDEX idx_payments_enrollment_id ON payments (enrollment_id);
CREATE INDEX idx_payments_status        ON payments (status);
CREATE INDEX idx_payments_paid_at       ON payments (paid_at);

-- ── REFUNDS ───────────────────────────────────────────────────────────

CREATE TABLE refunds (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id           UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  initiated_by         UUID NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  refund_amount        NUMERIC(10,2) NOT NULL,
  gateway_fee_deducted NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  reason               TEXT,
  status               refund_status NOT NULL DEFAULT 'pending',
  gateway_refund_id    VARCHAR(200),
  refunded_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_refunds_payment ON refunds (payment_id);

-- ── CERTIFICATES ──────────────────────────────────────────────────────

CREATE TABLE certificates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  enrollment_id  UUID NOT NULL REFERENCES enrollments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  cert_number    VARCHAR(100) NOT NULL,
  pdf_url        TEXT,
  admin_approved BOOLEAN NOT NULL DEFAULT FALSE,
  issued_at      TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_cert_number     UNIQUE (cert_number),
  CONSTRAINT uq_cert_enrollment UNIQUE (enrollment_id)
);
CREATE INDEX idx_certificates_user          ON certificates (user_id);
CREATE INDEX idx_certificates_admin_approved ON certificates (admin_approved)
  WHERE admin_approved = FALSE;

-- ── CERTIFICATE HARD COPY REQUESTS ────────────────────────────────────

CREATE TABLE certificate_hard_copy_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id   UUID NOT NULL REFERENCES certificates(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  shipping_fee     NUMERIC(8,2) NOT NULL,
  shipping_address TEXT NOT NULL,
  status           hardcopy_status NOT NULL DEFAULT 'pending',
  tracking_number  VARCHAR(100),
  requested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dispatched_at    TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ
);
CREATE INDEX idx_hardcopy_certificate ON certificate_hard_copy_requests (certificate_id);

-- ── JOB LISTINGS ──────────────────────────────────────────────────────

CREATE TABLE job_listings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by   UUID NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  title        VARCHAR(300) NOT NULL,
  company      VARCHAR(200),
  location     VARCHAR(200),
  listing_type job_listing_type NOT NULL DEFAULT 'job',
  description  TEXT,
  eligibility  TEXT,
  apply_url    TEXT,
  deadline     DATE,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);
CREATE TRIGGER trg_job_listings_updated_at
  BEFORE UPDATE ON job_listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_job_listings_type_active ON job_listings (listing_type, is_active);

-- ── JOB APPLICATIONS ──────────────────────────────────────────────────

CREATE TABLE job_applications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  job_listing_id UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE ON UPDATE CASCADE,
  cover_note     TEXT,
  resume_url     TEXT,
  status         application_status NOT NULL DEFAULT 'applied',
  applied_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_job_application UNIQUE (user_id, job_listing_id)
);
CREATE TRIGGER trg_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── BOARD MEMBERS ─────────────────────────────────────────────────────

CREATE TABLE board_members (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         VARCHAR(150) NOT NULL,
  designation       VARCHAR(200),
  company           VARCHAR(200),
  location_city     VARCHAR(100),
  location_country  VARCHAR(100),
  industry          VARCHAR(150),
  profile_photo_url TEXT,
  linkedin_url      TEXT,
  social_url_2      TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  display_order     INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_board_members_updated_at
  BEFORE UPDATE ON board_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_board_members_city     ON board_members (location_city);
CREATE INDEX idx_board_members_industry ON board_members (industry);

-- ── CAROUSEL SLIDES ───────────────────────────────────────────────────

CREATE TABLE carousel_slides (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url     TEXT NOT NULL,
  title         VARCHAR(300),
  subtitle      TEXT,
  cta_text      VARCHAR(100),
  cta_url       TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_carousel_updated_at
  BEFORE UPDATE ON carousel_slides
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── TESTIMONIALS ──────────────────────────────────────────────────────

CREATE TABLE testimonials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name  VARCHAR(150) NOT NULL,
  institution   VARCHAR(200),
  photo_url     TEXT,
  feedback_text TEXT NOT NULL,
  linkedin_url  TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── BLOG CATEGORIES ───────────────────────────────────────────────────

CREATE TABLE blog_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  slug       VARCHAR(120) NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_blog_categories_slug UNIQUE (slug)
);

-- ── BLOG POSTS ────────────────────────────────────────────────────────

CREATE TABLE blog_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID NOT NULL REFERENCES blog_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  author_id     UUID NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  title         VARCHAR(400) NOT NULL,
  slug          VARCHAR(450) NOT NULL,
  content       TEXT NOT NULL,
  thumbnail_url TEXT,
  status        content_status NOT NULL DEFAULT 'draft',
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,
  CONSTRAINT uq_blog_posts_slug UNIQUE (slug)
);
CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_blog_posts_category_status ON blog_posts (category_id, status);
CREATE INDEX idx_blog_posts_slug            ON blog_posts (slug);

-- ── EVENTS ────────────────────────────────────────────────────────────

CREATE TABLE events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by       UUID NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  title            VARCHAR(300) NOT NULL,
  description      TEXT,
  event_type       VARCHAR(50),
  location         VARCHAR(300),
  banner_url       TEXT,
  registration_url TEXT,
  event_date       TIMESTAMPTZ,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── STUDENT CHAPTERS ──────────────────────────────────────────────────
-- v1.1: reviewed_by added for admin accountability (REC-7).

CREATE TABLE student_chapters (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_name   VARCHAR(300) NOT NULL,
  contact_person VARCHAR(150) NOT NULL,
  email          VARCHAR(200) NOT NULL,
  mobile         VARCHAR(15) NOT NULL,
  city           VARCHAR(100),
  state          VARCHAR(100),
  student_count  INTEGER,
  status         collab_status NOT NULL DEFAULT 'pending',
  reviewed_by    UUID REFERENCES admin_users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  registered_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_student_chapters_updated_at
  BEFORE UPDATE ON student_chapters
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── INSTITUTION COLLABORATIONS ────────────────────────────────────────
-- v1.1: reviewed_by added (REC-7).

CREATE TABLE institution_collaborations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name  VARCHAR(300) NOT NULL,
  contact_person    VARCHAR(150) NOT NULL,
  email             VARCHAR(200) NOT NULL,
  mobile            VARCHAR(15) NOT NULL,
  city              VARCHAR(100),
  state             VARCHAR(100),
  student_count     INTEGER,
  preferred_program VARCHAR(300),
  status            collab_status NOT NULL DEFAULT 'pending',
  notes             TEXT,
  reviewed_by       UUID REFERENCES admin_users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  applied_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_institution_collab_updated_at
  BEFORE UPDATE ON institution_collaborations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── INDUSTRY ACADEMIA COLLABORATIONS ─────────────────────────────────
-- v1.1: reviewed_by added (REC-7).

CREATE TABLE industry_academia_collaborations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name VARCHAR(300) NOT NULL,
  contact_person    VARCHAR(150) NOT NULL,
  email             VARCHAR(200) NOT NULL,
  mobile            VARCHAR(15) NOT NULL,
  organization_type VARCHAR(100),
  proposal          TEXT,
  status            collab_status NOT NULL DEFAULT 'pending',
  reviewed_by       UUID REFERENCES admin_users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  applied_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_industry_academia_updated_at
  BEFORE UPDATE ON industry_academia_collaborations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── VIDEO GALLERY ─────────────────────────────────────────────────────

CREATE TABLE video_gallery (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name  VARCHAR(150),
  institution   VARCHAR(200),
  video_url     TEXT NOT NULL,
  thumbnail_url TEXT,
  platform      VARCHAR(30) DEFAULT 'youtube',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_video_gallery_updated_at
  BEFORE UPDATE ON video_gallery
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── ONLINE PROJECTS ───────────────────────────────────────────────────

CREATE TABLE online_projects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            VARCHAR(300) NOT NULL,
  description      TEXT,
  tech_stack       VARCHAR(300),
  difficulty_level VARCHAR(30),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_online_projects_updated_at
  BEFORE UPDATE ON online_projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── STUDY ABROAD PROGRAMS ─────────────────────────────────────────────

CREATE TABLE study_abroad_programs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              VARCHAR(300) NOT NULL,
  country            VARCHAR(100),
  partner_university VARCHAR(300),
  description        TEXT,
  program_type       VARCHAR(100),
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_study_abroad_updated_at
  BEFORE UPDATE ON study_abroad_programs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── STUDY ABROAD APPLICATIONS ─────────────────────────────────────────

CREATE TABLE study_abroad_applications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  program_id UUID NOT NULL REFERENCES study_abroad_programs(id) ON DELETE CASCADE ON UPDATE CASCADE,
  status     application_status NOT NULL DEFAULT 'applied',
  notes      TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_study_abroad_application UNIQUE (user_id, program_id)
);
CREATE TRIGGER trg_study_abroad_apps_updated_at
  BEFORE UPDATE ON study_abroad_applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── NOTIFICATIONS ─────────────────────────────────────────────────────

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  title      VARCHAR(200) NOT NULL,
  message    TEXT NOT NULL,
  type       VARCHAR(50),
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read);

-- ── ANNOUNCEMENTS ─────────────────────────────────────────────────────
-- v1.1: deleted_at added to support announcement retraction.

CREATE TABLE announcements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      UUID NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  title           VARCHAR(300) NOT NULL,
  message         TEXT NOT NULL,
  target_audience VARCHAR(50) NOT NULL DEFAULT 'all',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);
CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── CONTACT MESSAGES ──────────────────────────────────────────────────
-- v1.1: status promoted from VARCHAR(30) to contact_status ENUM (REC-1).

CREATE TABLE contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   VARCHAR(150) NOT NULL,
  email       VARCHAR(200) NOT NULL,
  mobile      VARCHAR(15),
  message     TEXT NOT NULL,
  status      contact_status NOT NULL DEFAULT 'unread',
  admin_reply TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── CMS PAGES ─────────────────────────────────────────────────────────

CREATE TABLE cms_pages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         VARCHAR(100) NOT NULL,
  title        VARCHAR(300) NOT NULL,
  content      TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_cms_pages_slug UNIQUE (slug)
);
CREATE TRIGGER trg_cms_pages_updated_at
  BEFORE UPDATE ON cms_pages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── SETTINGS ──────────────────────────────────────────────────────────
-- v1.1: created_at added for consistency with all other system tables (REC-3).

CREATE TABLE settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         VARCHAR(100) NOT NULL,
  value       TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_settings_key UNIQUE (key)
);
CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── ACTIVITY LOGS ─────────────────────────────────────────────────────
-- Append-only table. Never UPDATE or DELETE rows.

CREATE TABLE activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  action        VARCHAR(100) NOT NULL,
  entity_type   VARCHAR(50),
  entity_id     UUID,
  before_data   JSONB,
  after_data    JSONB,
  ip_address    VARCHAR(45),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_activity_logs_admin  ON activity_logs (admin_user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs (entity_type, entity_id);

-- ── STEP 3: VERIFICATION ────────────────────────────────────────────
-- Run this after the script completes to confirm all 41 tables exist.

SELECT COUNT(*) AS total_tables
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
