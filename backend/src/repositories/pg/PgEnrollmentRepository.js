/**
 * PgEnrollmentRepository — PostgreSQL Implementation
 *
 * Implements IEnrollmentRepository using the pg connection pool.
 * createWithPayment uses a transaction to atomically create both records.
 */

import { IEnrollmentRepository } from '../interfaces/IEnrollmentRepository.js';
import { pool } from '../../config/database.js';
import { query } from '../../config/database.js';

export class PgEnrollmentRepository extends IEnrollmentRepository {
  async createWithPayment(enrollmentData, paymentData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: enrollRows } = await client.query(
        `INSERT INTO enrollments (user_id, course_id, duration_fee_id, fee_paid)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [enrollmentData.user_id, enrollmentData.course_id,
         enrollmentData.duration_fee_id, enrollmentData.fee_paid]
      );
      const enrollment = enrollRows[0];

      const { rows: paymentRows } = await client.query(
        `INSERT INTO payments (user_id, enrollment_id, amount)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [paymentData.user_id, enrollment.id, paymentData.amount]
      );
      const payment = paymentRows[0];

      await client.query('COMMIT');
      return { enrollment, payment };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async findById(id) {
    const { rows } = await query(
      `SELECT e.*,
              json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email) AS user,
              json_build_object('id', c.id, 'title', c.title, 'type', c.type) AS course
       FROM enrollments e
       LEFT JOIN users u ON u.id = e.user_id
       LEFT JOIN courses c ON c.id = e.course_id
       WHERE e.id = $1 AND e.deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  }

  async findByUserAndCourse(userId, courseId) {
    const { rows } = await query(
      `SELECT * FROM enrollments
       WHERE user_id = $1 AND course_id = $2
         AND deleted_at IS NULL AND status != 'cancelled'`,
      [userId, courseId]
    );
    return rows[0] || null;
  }

  async findUserEnrollments(userId, statusFilter) {
    const conditions = ['e.user_id = $1', 'e.deleted_at IS NULL'];
    const values = [userId];
    let idx = 2;

    if (statusFilter) {
      conditions.push(`e.status = $${idx}`);
      values.push(statusFilter);
      idx++;
    }

    const { rows } = await query(
      `SELECT e.*,
              json_build_object('id', c.id, 'title', c.title, 'type', c.type,
                                'thumbnail_url', c.thumbnail_url) AS course
       FROM enrollments e
       LEFT JOIN courses c ON c.id = e.course_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY e.enrolled_at DESC`,
      values
    );
    return rows;
  }

  async listAdmin(filters, pagination) {
    const conditions = ['e.deleted_at IS NULL'];
    const values = [];
    let idx = 1;

    if (filters?.status) {
      conditions.push(`e.status = $${idx}`);
      values.push(filters.status);
      idx++;
    }
    if (filters?.user_id) {
      conditions.push(`e.user_id = $${idx}`);
      values.push(filters.user_id);
      idx++;
    }
    if (filters?.course_id) {
      conditions.push(`e.course_id = $${idx}`);
      values.push(filters.course_id);
      idx++;
    }

    const skip = pagination?.skip ?? 0;
    const take = pagination?.take ?? 10;
    values.push(take, skip);

    const { rows } = await query(
      `SELECT e.*,
              json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email) AS user,
              json_build_object('id', c.id, 'title', c.title) AS course
       FROM enrollments e
       LEFT JOIN users u ON u.id = e.user_id
       LEFT JOIN courses c ON c.id = e.course_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY e.enrolled_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );
    return rows;
  }

  async countAdmin(filters) {
    const conditions = ['deleted_at IS NULL'];
    const values = [];
    let idx = 1;

    if (filters?.status) {
      conditions.push(`status = $${idx}`);
      values.push(filters.status);
      idx++;
    }
    if (filters?.user_id) {
      conditions.push(`user_id = $${idx}`);
      values.push(filters.user_id);
      idx++;
    }
    if (filters?.course_id) {
      conditions.push(`course_id = $${idx}`);
      values.push(filters.course_id);
      idx++;
    }

    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM enrollments WHERE ${conditions.join(' AND ')}`,
      values
    );
    return rows[0].total;
  }

  async updateStatus(id, status) {
    const completedAt = status === 'completed' ? 'NOW()' : 'NULL';
    const { rows } = await query(
      `UPDATE enrollments SET status = $1, completed_at = ${completedAt}
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [status, id]
    );
    return rows[0] || null;
  }

  async softDelete(id) {
    await query(
      `UPDATE enrollments SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
  }
}
