/**
 * Admin Permission Authorization Middleware
 *
 * Checks that the authenticated admin has a specific permission before
 * allowing the request to proceed.
 *
 * From Backend-Architecture.md Section 7.2:
 *   - Super admin role bypasses all permission checks unconditionally.
 *   - All other roles are checked against the permissions array populated
 *     by authenticateAdmin.
 *
 * Must be used after authenticateAdmin — it depends on req.admin being set.
 *
 * Usage:
 *   router.post('/courses',
 *     authenticateAdmin(adminRepo),
 *     authorizePermission(PERMISSIONS.MANAGE_COURSES),
 *     asyncHandler(controller.create)
 *   );
 */

import { AppError } from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';
import { ROLES } from '../constants/roles.js';

/**
 * Returns an Express middleware that checks for the required permission.
 *
 * @param {string} permission - Permission name constant from PERMISSIONS
 * @returns {import('express').RequestHandler}
 */
const authorizePermission = (permission) => (req, _res, next) => {
  const admin = req.admin;

  if (!admin) {
    return next(new AppError(401, MESSAGES.UNAUTHORIZED));
  }

  // Super admin bypasses all permission checks
  const isSuperAdmin = Array.isArray(admin.roles) && admin.roles.includes(ROLES.SUPER_ADMIN);
  if (isSuperAdmin) {
    return next();
  }

  // Check the admin's permission list
  const hasPermission =
    Array.isArray(admin.permissions) && admin.permissions.includes(permission);

  if (!hasPermission) {
    return next(new AppError(403, MESSAGES.FORBIDDEN));
  }

  return next();
};

export default authorizePermission;
