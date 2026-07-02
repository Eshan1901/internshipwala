/**
 * Admin Service
 *
 * Contains all business logic for admin account management, RBAC, and
 * activity log querying. Depends exclusively on repository interfaces.
 *
 * Business rules enforced here (from Backend-Architecture.md Section 3.3):
 *   - Admin accounts are NEVER hard-deleted — only soft-deleted via deleted_at
 *   - A super_admin account cannot be deactivated by itself (safety guard)
 *   - Every sensitive admin write operation appends an activity_log record
 *   - Activity logs are append-only — never mutated or deleted
 */

import { AppError } from '../utils/AppError.js';
import { hashPassword } from '../utils/hash.js';
import { parsePaginationQuery, buildPaginationMeta } from '../utils/pagination.js';
import { MESSAGES } from '../constants/messages.js';
import { ROLES } from '../constants/roles.js';
import logger from '../logger/logger.js';

export class AdminService {
  /**
   * @param {import('../repositories/interfaces/IAdminRepository.js').IAdminRepository} adminRepo
   * @param {import('../repositories/interfaces/IActivityLogRepository.js').IActivityLogRepository} activityLogRepo
   */
  constructor(adminRepo, activityLogRepo) {
    this.adminRepo = adminRepo;
    this.activityLogRepo = activityLogRepo;
  }

  // ── Profile ────────────────────────────────────────────────────────────────

  /**
   * Get the authenticated admin's own profile.
   *
   * @param {string} adminId
   * @returns {Promise<object>} Admin record (without password_hash)
   */
  async getMe(adminId) {
    const admin = await this.adminRepo.findById(adminId);
    if (!admin) throw new AppError(404, MESSAGES.NOT_FOUND);
    return admin;
  }

  // ── Admin CRUD (super_admin only) ──────────────────────────────────────────

  /**
   * List all non-deleted admin accounts with pagination.
   *
   * @param {object} rawQuery - Express req.query (page, limit)
   * @returns {Promise<{ admins: object[], meta: object }>}
   */
  async listAdmins(rawQuery) {
    const { page, limit, skip, take } = parsePaginationQuery(rawQuery);
    const [admins, total] = await Promise.all([
      this.adminRepo.list({ skip, take }),
      this.adminRepo.count(),
    ]);
    return { admins, meta: buildPaginationMeta(total, page, limit) };
  }

  /**
   * Create a new admin account.
   * Password is hashed before storage. Requesting admin's action is logged.
   *
   * @param {{ full_name: string, email: string, password: string }} dto
   * @param {string} requestingAdminId - Admin performing the action (for audit log)
   * @param {string} ip - Client IP address
   * @returns {Promise<object>} Created admin (without password_hash)
   */
  async createAdmin(dto, requestingAdminId, ip) {
    const existing = await this.adminRepo.findByEmail(dto.email);
    if (existing) {
      throw new AppError(409, 'An admin account with this email already exists.');
    }

    const password_hash = await hashPassword(dto.password);

    const admin = await this.adminRepo.create({
      full_name: dto.full_name,
      email: dto.email,
      password_hash,
    });

    await this._logActivity({
      adminId: requestingAdminId,
      action: 'CREATE_ADMIN',
      entityType: 'admin_users',
      entityId: admin.id,
      afterData: { full_name: admin.full_name, email: admin.email },
      ip,
    });

    logger.info('Admin account created', { newAdminId: admin.id, by: requestingAdminId });

    return admin;
  }

  /**
   * Update an admin account's mutable fields.
   *
   * @param {string} targetAdminId - Admin being updated
   * @param {{ full_name?: string, is_active?: boolean }} dto
   * @param {string} requestingAdminId
   * @param {string} ip
   * @returns {Promise<object>} Updated admin
   */
  async updateAdmin(targetAdminId, dto, requestingAdminId, ip) {
    const existing = await this.adminRepo.findById(targetAdminId);
    if (!existing) throw new AppError(404, MESSAGES.NOT_FOUND);

    const updated = await this.adminRepo.update(targetAdminId, dto);

    await this._logActivity({
      adminId: requestingAdminId,
      action: 'UPDATE_ADMIN',
      entityType: 'admin_users',
      entityId: targetAdminId,
      beforeData: { full_name: existing.full_name, is_active: existing.is_active },
      afterData: dto,
      ip,
    });

    logger.info('Admin account updated', { targetAdminId, by: requestingAdminId });

    return updated;
  }

  /**
   * Soft-delete (deactivate) an admin account.
   * Sets deleted_at = NOW() and is_active = FALSE.
   * Hard delete is NEVER performed — activity_logs references admin_user_id
   * with ON DELETE RESTRICT.
   *
   * @param {string} targetAdminId - Admin to deactivate
   * @param {string} requestingAdminId - Admin performing the action
   * @param {string} ip
   * @returns {Promise<void>}
   */
  async deactivateAdmin(targetAdminId, requestingAdminId, ip) {
    if (targetAdminId === requestingAdminId) {
      throw new AppError(400, 'You cannot deactivate your own account.');
    }

    const existing = await this.adminRepo.findById(targetAdminId);
    if (!existing) throw new AppError(404, MESSAGES.NOT_FOUND);

    // Prevent deactivation of super_admin accounts
    const isSuperAdmin =
      Array.isArray(existing.roles) && existing.roles.includes(ROLES.SUPER_ADMIN);
    if (isSuperAdmin) {
      throw new AppError(403, 'Super admin accounts cannot be deactivated.');
    }

    await this.adminRepo.softDelete(targetAdminId);

    await this._logActivity({
      adminId: requestingAdminId,
      action: 'DEACTIVATE_ADMIN',
      entityType: 'admin_users',
      entityId: targetAdminId,
      ip,
    });

    logger.info('Admin account deactivated', { targetAdminId, by: requestingAdminId });
  }

  // ── Role Management ────────────────────────────────────────────────────────

  /**
   * Assign a role to an admin user.
   *
   * @param {string} targetAdminId
   * @param {string} roleId
   * @param {string} requestingAdminId
   * @param {string} ip
   * @returns {Promise<void>}
   */
  async assignRole(targetAdminId, roleId, requestingAdminId, ip) {
    const existing = await this.adminRepo.findById(targetAdminId);
    if (!existing) throw new AppError(404, MESSAGES.NOT_FOUND);

    await this.adminRepo.assignRole(targetAdminId, roleId);

    await this._logActivity({
      adminId: requestingAdminId,
      action: 'ASSIGN_ROLE',
      entityType: 'admin_user_roles',
      entityId: targetAdminId,
      afterData: { role_id: roleId },
      ip,
    });

    logger.info('Role assigned to admin', { targetAdminId, roleId, by: requestingAdminId });
  }

  /**
   * Remove a role from an admin user.
   *
   * @param {string} targetAdminId
   * @param {string} roleId
   * @param {string} requestingAdminId
   * @param {string} ip
   * @returns {Promise<void>}
   */
  async removeRole(targetAdminId, roleId, requestingAdminId, ip) {
    const existing = await this.adminRepo.findById(targetAdminId);
    if (!existing) throw new AppError(404, MESSAGES.NOT_FOUND);

    await this.adminRepo.removeRole(targetAdminId, roleId);

    await this._logActivity({
      adminId: requestingAdminId,
      action: 'REMOVE_ROLE',
      entityType: 'admin_user_roles',
      entityId: targetAdminId,
      afterData: { role_id: roleId },
      ip,
    });

    logger.info('Role removed from admin', { targetAdminId, roleId, by: requestingAdminId });
  }

  // ── Activity Logs ──────────────────────────────────────────────────────────

  /**
   * List activity log entries with optional filters and pagination.
   *
   * @param {object} rawQuery - Express req.query
   * @returns {Promise<{ logs: object[], meta: object }>}
   */
  async getActivityLogs(rawQuery) {
    const { page, limit, skip, take } = parsePaginationQuery(rawQuery);

    const filters = {
      admin_user_id: rawQuery.admin_user_id,
      entity_type: rawQuery.entity_type,
      action: rawQuery.action,
    };

    const [logs, total] = await Promise.all([
      this.activityLogRepo.list(filters, { skip, take }),
      this.activityLogRepo.count(filters),
    ]);

    return { logs, meta: buildPaginationMeta(total, page, limit) };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Append an activity log entry. Errors are logged but never thrown —
   * an audit log failure must never interrupt the primary operation.
   *
   * @param {{ adminId: string, action: string, entityType?: string,
   *            entityId?: string, beforeData?: object, afterData?: object,
   *            ip?: string }} params
   * @private
   */
  async _logActivity({ adminId, action, entityType, entityId, beforeData, afterData, ip }) {
    try {
      await this.activityLogRepo.create({
        admin_user_id: adminId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        before_data: beforeData,
        after_data: afterData,
        ip_address: ip,
      });
    } catch (err) {
      // Log the failure but do not propagate — audit log failure is non-fatal
      logger.error('Failed to write activity log', { action, entityId, error: err.message });
    }
  }
}
