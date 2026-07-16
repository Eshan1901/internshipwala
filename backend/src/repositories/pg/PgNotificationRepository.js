/**
 * PgNotificationRepository — PostgreSQL Implementation
 *
 * Implements INotificationRepository using the pg connection pool.
 */

import { INotificationRepository } from '../interfaces/INotificationRepository.js';
import { query } from '../../config/database.js';

export class PgNotificationRepository extends INotificationRepository {
  async create(data) {
    const { rows } = await query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.user_id, data.title, data.message, data.type || null]
    );
    return rows[0];
  }

  async listByUser(userId, pagination) {
    const skip = pagination?.skip ?? 0;
    const take = pagination?.take ?? 10;

    const { rows } = await query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, take, skip]
    );
    return rows;
  }

  async countByUser(userId) {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM notifications WHERE user_id = $1`,
      [userId]
    );
    return rows[0].total;
  }

  async findById(id) {
    const { rows } = await query(
      `SELECT * FROM notifications WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async markRead(id) {
    await query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1`,
      [id]
    );
  }

  async markAllRead(userId) {
    await query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
  }
}
