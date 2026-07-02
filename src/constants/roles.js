/**
 * Admin Role Name Constants
 *
 * These values match exactly the role names inserted in the database seed
 * (Database-Design.md Section 10.2). Never use raw strings for role checks —
 * always import from this file.
 *
 * The SUPER_ADMIN role bypasses all permission checks. All other roles
 * are checked against the permissions table.
 */

export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  CONTENT_MANAGER: 'content_manager',
  STUDENT_MANAGER: 'student_manager',
  FINANCE_MANAGER: 'finance_manager',
  SUPPORT_STAFF: 'support_staff',
});
