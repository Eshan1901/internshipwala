/**
 * Standard API Response Messages
 *
 * Centralised string constants for all API response messages.
 * Using constants prevents typos, makes messages easy to update,
 * and keeps response text consistent across all endpoints.
 *
 * Rules (from AI_INSTRUCTIONS.md):
 *  - Never expose internal error details, stack traces, or SQL errors.
 *  - Auth error messages must not reveal whether email or password was wrong
 *    (prevents user enumeration). Always use INVALID_CREDENTIALS for both cases.
 */

export const MESSAGES = Object.freeze({
  // ── Authentication ──────────────────────────────────────────────
  REGISTER_SUCCESS: 'Registration successful. Please check your email for the OTP.',
  OTP_SENT: 'OTP sent successfully. Please check your email.',
  OTP_VERIFIED: 'Email verified successfully. You can now log in.',
  OTP_RESENT: 'OTP resent successfully.',
  LOGIN_SUCCESS: 'Login successful.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PASSWORD_RESET_INITIATED: 'If an account with that email exists, an OTP has been sent.',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',

  // Auth errors — deliberately vague to prevent user enumeration
  INVALID_CREDENTIALS: 'Invalid email or password.',
  INVALID_OTP: 'Invalid or expired OTP.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in.',
  ACCOUNT_DEACTIVATED: 'Your account has been deactivated. Please contact support.',
  UNAUTHORIZED: 'Authentication required. Please log in.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  TOKEN_INVALID: 'Invalid authentication token.',

  // ── User / Profile ───────────────────────────────────────────────
  PROFILE_FETCHED: 'Profile fetched successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PHOTO_UPLOADED: 'Profile photo uploaded successfully.',

  // ── Courses ──────────────────────────────────────────────────────
  COURSES_FETCHED: 'Courses fetched successfully.',
  COURSE_FETCHED: 'Course fetched successfully.',
  COURSE_CREATED: 'Course created successfully.',
  COURSE_UPDATED: 'Course updated successfully.',
  COURSE_DELETED: 'Course deleted successfully.',
  COURSE_PUBLISHED: 'Course published successfully.',
  CATEGORIES_FETCHED: 'Categories fetched successfully.',
  MODULE_CREATED: 'Module created successfully.',
  MODULE_UPDATED: 'Module updated successfully.',
  MODULE_DELETED: 'Module deleted successfully.',
  DURATION_FEE_CREATED: 'Duration/fee option created successfully.',

  // ── Enrollment ───────────────────────────────────────────────────
  ENROLLED_SUCCESS: 'Enrolled successfully. Please complete payment to activate your course.',
  ENROLLMENTS_FETCHED: 'Enrollments fetched successfully.',
  ENROLLMENT_ACTIVATED: 'Enrollment activated successfully.',
  ENROLLMENT_CANCELLED: 'Enrollment cancelled successfully.',
  MODULES_FETCHED: 'Modules fetched successfully.',
  MODULE_COMPLETED: 'Module marked as complete.',
  ASSIGNMENT_SUBMITTED: 'Assignment submitted successfully.',

  // ── Payments ─────────────────────────────────────────────────────
  PAYMENTS_FETCHED: 'Payments fetched successfully.',
  PAYMENT_CONFIRMED: 'Payment confirmed. Course access has been activated.',
  PAYMENT_REJECTED: 'Payment rejected.',
  REFUND_INITIATED: 'Refund initiated successfully.',

  // ── Certificates ─────────────────────────────────────────────────
  CERTIFICATES_FETCHED: 'Certificates fetched successfully.',
  CERTIFICATE_VERIFIED: 'Certificate is valid.',
  CERTIFICATE_APPROVED: 'Certificate approved successfully.',
  HARD_COPY_REQUESTED: 'Hard copy request submitted successfully.',
  HARD_COPY_UPDATED: 'Hard copy request updated successfully.',

  // ── Blog ─────────────────────────────────────────────────────────
  BLOGS_FETCHED: 'Blog posts fetched successfully.',
  BLOG_FETCHED: 'Blog post fetched successfully.',
  BLOG_CREATED: 'Blog post created successfully.',
  BLOG_UPDATED: 'Blog post updated successfully.',
  BLOG_DELETED: 'Blog post deleted successfully.',

  // ── Jobs ─────────────────────────────────────────────────────────
  JOBS_FETCHED: 'Job listings fetched successfully.',
  JOB_FETCHED: 'Job listing fetched successfully.',
  JOB_CREATED: 'Job listing created successfully.',
  JOB_UPDATED: 'Job listing updated successfully.',
  JOB_DELETED: 'Job listing deleted successfully.',
  JOB_APPLIED: 'Application submitted successfully.',
  APPLICANTS_FETCHED: 'Applicants fetched successfully.',

  // ── Notifications ─────────────────────────────────────────────────
  NOTIFICATIONS_FETCHED: 'Notifications fetched successfully.',
  NOTIFICATION_READ: 'Notification marked as read.',
  ALL_NOTIFICATIONS_READ: 'All notifications marked as read.',
  NOTIFICATION_SENT: 'Notification sent successfully.',

  // ── CMS / Public ─────────────────────────────────────────────────
  CONTENT_FETCHED: 'Content fetched successfully.',
  CONTENT_CREATED: 'Content created successfully.',
  CONTENT_UPDATED: 'Content updated successfully.',
  CONTENT_DELETED: 'Content deleted successfully.',

  // ── Contact ──────────────────────────────────────────────────────
  CONTACT_SUBMITTED: 'Your message has been received. We will get back to you soon.',
  CONTACT_MESSAGES_FETCHED: 'Contact messages fetched successfully.',
  CONTACT_UPDATED: 'Contact message updated successfully.',

  // ── Collaborations ────────────────────────────────────────────────
  COLLABORATION_SUBMITTED: 'Your application has been received.',
  COLLABORATIONS_FETCHED: 'Collaboration requests fetched successfully.',
  COLLABORATION_STATUS_UPDATED: 'Collaboration status updated successfully.',

  // ── Admin ─────────────────────────────────────────────────────────
  ADMINS_FETCHED: 'Admin users fetched successfully.',
  ADMIN_CREATED: 'Admin user created successfully.',
  ADMIN_UPDATED: 'Admin user updated successfully.',
  ADMIN_DEACTIVATED: 'Admin user deactivated successfully.',
  ACTIVITY_LOGS_FETCHED: 'Activity logs fetched successfully.',
  DASHBOARD_FETCHED: 'Dashboard statistics fetched successfully.',

  // ── Generic errors ────────────────────────────────────────────────
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'A record with this information already exists.',
  VALIDATION_FAILED: 'Validation failed. Please check the provided data.',
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.',
  TOO_MANY_REQUESTS: 'Too many requests. Please wait before trying again.',
});
