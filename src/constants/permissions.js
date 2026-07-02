/**
 * Admin Permission Name Constants
 *
 * These values match exactly the permission names inserted in the database seed
 * (Database-Design.md Section 10.3). Always use these constants in
 * authorizePermission() middleware calls — never raw strings.
 *
 * Usage:
 *   router.post('/courses', authenticateAdmin, authorizePermission(PERMISSIONS.MANAGE_COURSES), ...)
 */

export const PERMISSIONS = Object.freeze({
  // Dashboard
  VIEW_DASHBOARD: 'View Dashboard',

  // Courses
  MANAGE_COURSES: 'Manage Courses',
  EDIT_COURSES: 'Edit Courses',
  DELETE_COURSES: 'Delete Courses',
  VIEW_COURSES: 'View Courses',

  // Students
  MANAGE_STUDENTS: 'Manage Students',
  EDIT_STUDENTS: 'Edit Students',
  VIEW_STUDENTS: 'View Students',
  DISABLE_STUDENTS: 'Disable Students',

  // Payments
  VIEW_PAYMENTS: 'View Payments',
  APPROVE_PAYMENTS: 'Approve Payments',
  PROCESS_REFUNDS: 'Process Refunds',

  // Certificates
  GENERATE_CERTIFICATES: 'Generate Certificates',
  APPROVE_CERTIFICATES: 'Approve Certificates',

  // Jobs
  MANAGE_JOB_LISTINGS: 'Manage Job Listings',
  EDIT_JOB_LISTINGS: 'Edit Job Listings',
  DELETE_JOB_LISTINGS: 'Delete Job Listings',

  // Blog
  MANAGE_BLOG: 'Manage Blog',
  EDIT_BLOG: 'Edit Blog',

  // CMS
  MANAGE_CMS_PAGES: 'Manage CMS Pages',
  EDIT_CMS_PAGES: 'Edit CMS Pages',

  // Notifications
  SEND_NOTIFICATIONS: 'Send Notifications',

  // Logs
  VIEW_ACTIVITY_LOGS: 'View Activity Logs',

  // Settings
  MANAGE_SETTINGS: 'Manage Settings',
});
