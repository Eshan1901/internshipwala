/**
 * Admin Validators
 *
 * Zod schemas for admin management endpoints.
 * All schemas are imported into admin.routes.js and applied via validate() middleware.
 */

import { z } from 'zod';
import { zEmail, zPassword, zString, zPage, zLimit, zUuid } from './common.js';

/**
 * POST /api/admin/admins — create a new admin account (super_admin only)
 */
export const createAdminSchema = z.object({
  full_name: zString
    .min(2, 'Full name must be at least 2 characters.')
    .max(150, 'Full name must be at most 150 characters.'),
  email: zEmail,
  password: zPassword,
});

/**
 * PUT /api/admin/admins/:id — update admin profile (super_admin only)
 * All fields optional — only provided fields are updated.
 */
export const updateAdminSchema = z
  .object({
    full_name: zString
      .min(2, 'Full name must be at least 2 characters.')
      .max(150, 'Full name must be at most 150 characters.')
      .optional(),
    is_active: z.boolean().optional(),
  })
  .strict();

/**
 * POST /api/admin/admins/:id/roles — assign a role to an admin
 */
export const assignRoleSchema = z.object({
  role_id: zUuid,
});

/**
 * DELETE /api/admin/admins/:id/roles/:roleId — validated via URL params only
 * No body required; roleId validated as UUID param.
 */

/**
 * GET /api/admin/admins — list admins (query params)
 */
export const listAdminsQuerySchema = z.object({
  page: zPage,
  limit: zLimit,
});

/**
 * GET /api/admin/activity-logs — query params
 */
export const listActivityLogsQuerySchema = z.object({
  page: zPage,
  limit: zLimit,
  admin_user_id: zUuid.optional(),
  entity_type: z.string().trim().max(50).optional(),
  action: z.string().trim().max(100).optional(),
});

/**
 * Param schema for routes expecting :id as UUID
 */
export const adminIdParamSchema = z.object({
  id: zUuid,
});

/**
 * Param schema for role assignment/removal: :id and :roleId
 */
export const adminRoleParamSchema = z.object({
  id: zUuid,
  roleId: zUuid,
});
