/**
 * PgAdminRepository — PostgreSQL Implementation
 *
 * Implements IAdminRepository using the pg connection pool.
 * findByEmail and findById return populated roles and permissions arrays.
 * Soft-delete rule: all reads exclude deleted_at IS NOT NULL.
 */

import { IAdminRepository } from '../interfaces/IAdminRepository.js';
import { query } from '../../config/database.js';

export class PgAdminRepository extends IAdminRepository {
  /**
   * Populate roles and permissions for an admin record.
   * @param {object} admin - Raw admin row
   * @returns {Promise<object>} Admin with roles[] and permissions[]
   */
  async _populateRolesAndPermissions(admin) {
    if (!admin) return null;

    // Fetch roles
    const { rows: roleRows } = await query(
      `SELECT r.id, r.name, r.description
       FROM roles r
       JOIN admin_user_roles aur ON aur.role_id = r.id
       WHERE aur.admin_user_id = $1`,
      [admin.id]
    );

    // Fetch permissions (via roles)
    const { rows: permRows } = await query(
      `SELECT DISTINCT p.id, p.name, p.module, p.action
       FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       JOIN admin_user_roles aur ON aur.role_id = rp.role_id
       WHERE aur.admin_user_id = $1`,
      [admin.id]
    );

    admin.roles = roleRows.map((r) => r.name);
    admin.permissions = permRows.map((p) => `${p.module}:${p.action}`);

    return admin;
  }

  async findByEmail(email) {
    const { rows } = await query(
      `SELECT * FROM admin_users WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );
    return this._populateRolesAndPermissions(rows[0] || null);
  }

  async findById(id) {
    const { rows } = await query(
      `SELECT * FROM admin_users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return this._populateRolesAndPermissions(rows[0] || null);
  }

  async create(data) {
    const { rows } = await query(
      `INSERT INTO admin_users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, is_active, last_login_at, created_at, updated_at`,
      [data.full_name, data.email, data.password_hash]
    );
    return rows[0];
  }

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const { rows } = await query(
      `UPDATE admin_users SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL
       RETURNING id, full_name, email, is_active, last_login_at, created_at, updated_at`,
      values
    );
    return rows[0] || null;
  }

  async softDelete(id) {
    await query(
      `UPDATE admin_users SET deleted_at = NOW(), is_active = FALSE WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
  }

  async updateLastLogin(id) {
    await query(
      `UPDATE admin_users SET last_login_at = NOW() WHERE id = $1`,
      [id]
    );
  }

  async list(pagination) {
    const skip = pagination?.skip ?? 0;
    const take = pagination?.take ?? 10;

    const { rows } = await query(
      `SELECT id, full_name, email, is_active, last_login_at, created_at, updated_at
       FROM admin_users
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [take, skip]
    );
    return rows;
  }

  async assignRole(adminId, roleId) {
    await query(
      `INSERT INTO admin_user_roles (admin_user_id, role_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [adminId, roleId]
    );
  }

  async removeRole(adminId, roleId) {
    await query(
      `DELETE FROM admin_user_roles WHERE admin_user_id = $1 AND role_id = $2`,
      [adminId, roleId]
    );
  }

  async count() {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM admin_users WHERE deleted_at IS NULL`
    );
    return rows[0].total;
  }
}
