/**
 * Admin Controller
 *
 * HTTP boundary for all admin management operations.
 * No business logic. No database access.
 * Responsibilities: parse request → call AdminService → return response.
 */

import { sendSuccess } from '../utils/response.js';
import { MESSAGES } from '../constants/messages.js';

export class AdminController {
  /**
   * @param {import('../services/admin.service.js').AdminService} adminService
   */
  constructor(adminService) {
    this.adminService = adminService;
  }

  /**
   * GET /api/admin/me
   * Returns the authenticated admin's own profile.
   */
  getMe = async (req, res, next) => {
    try {
      const admin = await this.adminService.getMe(req.admin.id);
      return sendSuccess(res, 200, MESSAGES.PROFILE_FETCHED, admin);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * GET /api/admin/admins
   * List all admin accounts (paginated).
   */
  listAdmins = async (req, res, next) => {
    try {
      const { admins, meta } = await this.adminService.listAdmins(req.query);
      return sendSuccess(res, 200, MESSAGES.ADMINS_FETCHED, admins, meta);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * POST /api/admin/admins
   * Create a new admin account (super_admin only).
   */
  createAdmin = async (req, res, next) => {
    try {
      const admin = await this.adminService.createAdmin(
        req.body,
        req.admin.id,
        req.ip
      );
      return sendSuccess(res, 201, MESSAGES.ADMIN_CREATED, admin);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * PUT /api/admin/admins/:id
   * Update an admin account (super_admin only).
   */
  updateAdmin = async (req, res, next) => {
    try {
      const admin = await this.adminService.updateAdmin(
        req.params.id,
        req.body,
        req.admin.id,
        req.ip
      );
      return sendSuccess(res, 200, MESSAGES.ADMIN_UPDATED, admin);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * DELETE /api/admin/admins/:id
   * Soft-deactivate an admin account (super_admin only).
   */
  deactivateAdmin = async (req, res, next) => {
    try {
      await this.adminService.deactivateAdmin(req.params.id, req.admin.id, req.ip);
      return sendSuccess(res, 200, MESSAGES.ADMIN_DEACTIVATED);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * POST /api/admin/admins/:id/roles
   * Assign a role to an admin (super_admin only).
   */
  assignRole = async (req, res, next) => {
    try {
      await this.adminService.assignRole(
        req.params.id,
        req.body.role_id,
        req.admin.id,
        req.ip
      );
      return sendSuccess(res, 200, 'Role assigned successfully.');
    } catch (err) {
      return next(err);
    }
  };

  /**
   * DELETE /api/admin/admins/:id/roles/:roleId
   * Remove a role from an admin (super_admin only).
   */
  removeRole = async (req, res, next) => {
    try {
      await this.adminService.removeRole(
        req.params.id,
        req.params.roleId,
        req.admin.id,
        req.ip
      );
      return sendSuccess(res, 200, 'Role removed successfully.');
    } catch (err) {
      return next(err);
    }
  };

  /**
   * GET /api/admin/activity-logs
   * Retrieve paginated activity audit log.
   */
  getActivityLogs = async (req, res, next) => {
    try {
      const { logs, meta } = await this.adminService.getActivityLogs(req.query);
      return sendSuccess(res, 200, MESSAGES.ACTIVITY_LOGS_FETCHED, logs, meta);
    } catch (err) {
      return next(err);
    }
  };
}
