/**
 * Admin Router — Root
 *
 * All routes under /api/admin pass through here.
 * authenticateAdmin is applied once at this level — every sub-route is
 * automatically protected without repeating the middleware in each file.
 *
 * Dependency injection: repository interfaces are instantiated here and
 * passed into services and controllers. When concrete Prisma implementations
 * are delivered, only the import statements at the top of this file change.
 *
 * Per-route permission checks are applied per-handler because different
 * admin endpoints require different permissions.
 */

import { Router } from 'express';

import { IAdminRepository } from '../../repositories/interfaces/IAdminRepository.js';
import { IActivityLogRepository } from '../../repositories/interfaces/IActivityLogRepository.js';

import { AdminService } from '../../services/admin.service.js';
import { AdminController } from '../../controllers/admin.controller.js';
import authenticateAdmin from '../../middlewares/authenticateAdmin.js';
import authorizePermission from '../../middlewares/authorizePermission.js';
import { validate } from '../../middlewares/validate.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/AppError.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import { ROLES } from '../../constants/roles.js';
import adminNotificationsRouter from './notifications.routes.js';
import adminEnrollmentsRouter from './enrollments.routes.js';
import adminPaymentsRouter from './payments.routes.js';
import adminCertificatesRouter from './certificates.routes.js';
import adminBlogRouter from './blog.routes.js';
import adminJobsRouter from './jobs.routes.js';

import {
  createAdminSchema,
  updateAdminSchema,
  assignRoleSchema,
  listAdminsQuerySchema,
  listActivityLogsQuerySchema,
  adminIdParamSchema,
  adminRoleParamSchema,
} from '../../validators/admin.validator.js';

// ── Dependency injection ──────────────────────────────────────────────────────
const adminRepo = new IAdminRepository();
const activityLogRepo = new IActivityLogRepository();

const adminService = new AdminService(adminRepo, activityLogRepo);
const adminController = new AdminController(adminService);

// ── Super-admin guard ─────────────────────────────────────────────────────────
/**
 * Middleware that restricts access to super_admin role only.
 * Applied to admin CRUD routes because the spec states those are
 * "super-admin only" operations.
 * authenticateAdmin must run before this middleware (guaranteed by router.use above).
 */
const requireSuperAdmin = (req, _res, next) => {
  const isSuperAdmin =
    Array.isArray(req.admin.roles) && req.admin.roles.includes(ROLES.SUPER_ADMIN);
  if (!isSuperAdmin) {
    return next(new AppError(403, 'Only super admins can perform this action.'));
  }
  return next();
};

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

// Apply admin JWT authentication to every route in this router
router.use(authenticateAdmin(adminRepo));

// ── Own profile ───────────────────────────────────────────────────────────────
// GET /api/admin/me — any authenticated admin
router.get(
  '/me',
  asyncHandler(adminController.getMe)
);

// ── Admin management (super_admin only) ───────────────────────────────────────

// GET /api/admin/admins — list all admins (any authenticated admin can view)
router.get(
  '/admins',
  validate(listAdminsQuerySchema, 'query'),
  asyncHandler(adminController.listAdmins)
);

// POST /api/admin/admins — create admin (super_admin only)
router.post(
  '/admins',
  requireSuperAdmin,
  validate(createAdminSchema),
  asyncHandler(adminController.createAdmin)
);

// PUT /api/admin/admins/:id — update admin (super_admin only)
router.put(
  '/admins/:id',
  requireSuperAdmin,
  validate(adminIdParamSchema, 'params'),
  validate(updateAdminSchema),
  asyncHandler(adminController.updateAdmin)
);

// DELETE /api/admin/admins/:id — soft-deactivate admin (super_admin only)
router.delete(
  '/admins/:id',
  requireSuperAdmin,
  validate(adminIdParamSchema, 'params'),
  asyncHandler(adminController.deactivateAdmin)
);

// ── Role management (super_admin only) ────────────────────────────────────────

// POST /api/admin/admins/:id/roles — assign role
router.post(
  '/admins/:id/roles',
  requireSuperAdmin,
  validate(adminIdParamSchema, 'params'),
  validate(assignRoleSchema),
  asyncHandler(adminController.assignRole)
);

// DELETE /api/admin/admins/:id/roles/:roleId — remove role
router.delete(
  '/admins/:id/roles/:roleId',
  requireSuperAdmin,
  validate(adminRoleParamSchema, 'params'),
  asyncHandler(adminController.removeRole)
);

// ── Activity logs ─────────────────────────────────────────────────────────────

// GET /api/admin/activity-logs — requires VIEW_ACTIVITY_LOGS permission
router.get(
  '/activity-logs',
  authorizePermission(PERMISSIONS.VIEW_ACTIVITY_LOGS),
  validate(listActivityLogsQuerySchema, 'query'),
  asyncHandler(adminController.getActivityLogs)
);

// ── Admin notifications sub-router ────────────────────────────────────────────
router.use('/notifications', adminNotificationsRouter);

// ── Admin enrollments sub-router ──────────────────────────────────────────────
router.use('/enrollments', adminEnrollmentsRouter);

// ── Admin payments sub-router ─────────────────────────────────────────────────
router.use('/payments', adminPaymentsRouter);

// ── Admin certificates sub-router ────────────────────────────────────────────
router.use('/certificates', adminCertificatesRouter);

// ── Admin blog sub-router ─────────────────────────────────────────────────────
router.use('/blog', adminBlogRouter);

// ── Admin jobs sub-router ─────────────────────────────────────────────────────
router.use('/jobs', adminJobsRouter);

export default router;
