/**
 * Application Enumerations
 *
 * JavaScript equivalents of the PostgreSQL ENUM types defined in the
 * database schema (Database-Design.md Section 9 — SQL Schema).
 *
 * These are used throughout services and validators to avoid magic strings.
 * Values must match the database ENUM values exactly — any mismatch will
 * cause a database constraint error at runtime.
 */

/**
 * Course delivery type
 * DB type: course_type
 */
export const CourseType = Object.freeze({
  ONLINE: 'online',
  OFFLINE: 'offline',
  INDUSTRIAL: 'industrial',
});

/**
 * Course lifecycle status
 * DB type: course_status
 */
export const CourseStatus = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
});

/**
 * Blog post and CMS content status
 * DB type: content_status
 */
export const ContentStatus = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
});

/**
 * Student enrollment lifecycle status
 * DB type: enrollment_status
 */
export const EnrollmentStatus = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

/**
 * Payment transaction status
 * DB type: payment_status
 */
export const PaymentStatus = Object.freeze({
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
});

/**
 * Refund processing status
 * DB type: refund_status
 */
export const RefundStatus = Object.freeze({
  PENDING: 'pending',
  PROCESSED: 'processed',
  FAILED: 'failed',
});

/**
 * Certificate hard copy dispatch status
 * DB type: hardcopy_status
 */
export const HardcopyStatus = Object.freeze({
  PENDING: 'pending',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
});

/**
 * Assignment/quiz type
 * DB type: assignment_type
 */
export const AssignmentType = Object.freeze({
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  PROJECT: 'project',
  EXERCISE: 'exercise',
});

/**
 * Assignment submission grading status
 * DB type: submission_status
 */
export const SubmissionStatus = Object.freeze({
  SUBMITTED: 'submitted',
  REVIEWED: 'reviewed',
  PASSED: 'passed',
  FAILED: 'failed',
});

/**
 * Job and internship listing type
 * DB type: job_listing_type
 */
export const JobListingType = Object.freeze({
  INTERNSHIP: 'internship',
  JOB: 'job',
  TEACHING: 'teaching',
  CORPORATE: 'corporate',
  OVERSEAS: 'overseas',
});

/**
 * Job and study-abroad application status
 * DB type: application_status
 */
export const ApplicationStatus = Object.freeze({
  APPLIED: 'applied',
  REVIEWED: 'reviewed',
  SHORTLISTED: 'shortlisted',
  REJECTED: 'rejected',
});

/**
 * Collaboration request status (student chapters, institutions, industry)
 * DB type: collab_status
 */
export const CollabStatus = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

/**
 * Contact form message status
 * DB type: contact_status
 */
export const ContactStatus = Object.freeze({
  UNREAD: 'unread',
  READ: 'read',
  REPLIED: 'replied',
  CLOSED: 'closed',
});
