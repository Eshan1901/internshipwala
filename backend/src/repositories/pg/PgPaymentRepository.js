/**
 * PgPaymentRepository — PostgreSQL Implementation
 *
 * Implements IPaymentRepository using the pg connection pool.
 * confirmPayment and createRefund use transactions.
 */

import { IPaymentRepository } from '../interfaces/IPaymentRepository.js';
import { pool, query } from '../../config/database.js';

export class PgPaymentRepository extends IPaymentRepository {
  async findById(id) {
    const { rows } = await query(
      `SELECT p.*,
              json_build_object('id', e.id, 'status', e.status, 'course_id', e.course_id) AS enrollment,
              json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email) AS user
       FROM payments p
       LEFT JOIN enrollments e ON e.id = p.enrollment_id
       LEFT JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByEnrollmentId(enrollmentId) {
    const { rows } = await query(
      `SELECT * FROM payments WHERE enrollment_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [enrollmentId]
    );
    return rows[0] || null;
  }

  async listByUser(userId, pagination) {
    const skip = pagination?.skip ?? 0;
    const take = pagination?.take ?? 10;

    const { rows } = await query(
      `SELECT p.*,
              json_build_object('id', e.id, 'course_id', e.course_id, 'status', e.status) AS enrollment,
              json_build_object('id', c.id, 'title', c.title) AS course
       FROM payments p
       LEFT JOIN enrollments e ON e.id = p.enrollment_id
       LEFT JOIN courses c ON c.id = e.course_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, take, skip]
    );
    return rows;
  }

  async countByUser(userId) {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM payments WHERE user_id = $1`,
      [userId]
    );
    return rows[0].total;
  }

  async listAdmin(filters, pagination) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters?.status) {
      conditions.push(`p.status = $${idx}`);
      values.push(filters.status);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const skip = pagination?.skip ?? 0;
    const take = pagination?.take ?? 10;
    values.push(take, skip);

    const { rows } = await query(
      `SELECT p.*,
              json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email) AS user,
              json_build_object('id', e.id, 'course_id', e.course_id, 'status', e.status) AS enrollment
       FROM payments p
       LEFT JOIN users u ON u.id = p.user_id
       LEFT JOIN enrollments e ON e.id = p.enrollment_id
       ${where}
       ORDER BY p.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );
    return rows;
  }

  async countAdmin(filters) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters?.status) {
      conditions.push(`status = $${idx}`);
      values.push(filters.status);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM payments ${where}`,
      values
    );
    return rows[0].total;
  }

  async confirmPayment(paymentId, enrollmentId, gatewayTxnId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: paymentRows } = await client.query(
        `UPDATE payments SET status = 'success', gateway_txn_id = $1, paid_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [gatewayTxnId, paymentId]
      );

      await client.query(
        `UPDATE enrollments SET status = 'active' WHERE id = $1`,
        [enrollmentId]
      );

      await client.query('COMMIT');
      return paymentRows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async rejectPayment(paymentId) {
    const { rows } = await query(
      `UPDATE payments SET status = 'failed' WHERE id = $1 RETURNING *`,
      [paymentId]
    );
    return rows[0] || null;
  }

  async createRefund(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: refundRows } = await client.query(
        `INSERT INTO refunds (payment_id, initiated_by, refund_amount, gateway_fee_deducted, reason)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [data.payment_id, data.initiated_by, data.refund_amount,
         data.gateway_fee_deducted, data.reason || null]
      );

      await client.query(
        `UPDATE payments SET status = 'refunded' WHERE id = $1`,
        [data.payment_id]
      );

      await client.query('COMMIT');
      return refundRows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
