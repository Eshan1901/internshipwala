/**
 * PgActivityLogRepository — PostgreSQL Implementation
 *
 * Implements IActivityLogRepository using the pg connection pool.
 * Append-only table — never UPDATE or DELETE rows.
 */

import { IActivityLogRepository } from '../interfaces/IActivityLogRepository.js';
import { query } from '../../config/database.js';

export class PgActivityLogRepository extends IActivityLogRepository {
  async create(data) {
    const { rows } = await query(
      `INSERT INTO activity_logs (admin_user_id, action, entity_type, entity_id, before_data, after_data, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.admin_user_id,
        data.action,
        data.entity_type || null,
        data.entity_id || null,
        data.before_data ? JSON.stringify(data.before_data) : null,
        data.after_data ? JSON.stringify(data.after_data) : null,
        data.ip_address || null,
      ]
    );
    return rows[0];
  }

  async list(filters, pagination) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters?.admin_user_id) {
      conditions.push(`al.admin_user_id = $${idx}`);
      values.push(filters.admin_user_id);
      idx++;
    }
    if (filters?.entity_type) {
      conditions.push(`al.entity_type = $${idx}`);
      values.push(filters.entity_type);
      idx++;
    }
    if (filters?.action) {
      conditions.push(`al.action = $${idx}`);
      values.push(filters.action);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const skip = pagination?.skip ?? 0;
    const take = pagination?.take ?? 10;
    values.push(take, skip);

    const { rows } = await query(
      `SELECT al.*,
              json_build_object('id', au.id, 'full_name', au.full_name, 'email', au.email) AS admin_user
       FROM activity_logs al
       LEFT JOIN admin_users au ON au.id = al.admin_user_id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );
    return rows;
  }

  async count(filters) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters?.admin_user_id) {
      conditions.push(`admin_user_id = $${idx}`);
      values.push(filters.admin_user_id);
      idx++;
    }
    if (filters?.entity_type) {
      conditions.push(`entity_type = $${idx}`);
      values.push(filters.entity_type);
      idx++;
    }
    if (filters?.action) {
      conditions.push(`action = $${idx}`);
      values.push(filters.action);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM activity_logs ${where}`,
      values
    );
    return rows[0].total;
  }
}
