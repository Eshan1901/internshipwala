/**
 * PgCertificateRepository — PostgreSQL Implementation
 *
 * Implements ICertificateRepository using the pg connection pool.
 */

import { ICertificateRepository } from '../interfaces/ICertificateRepository.js';
import { query } from '../../config/database.js';

export class PgCertificateRepository extends ICertificateRepository {
  async create(data) {
    const { rows } = await query(
      `INSERT INTO certificates (user_id, enrollment_id, cert_number)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.user_id, data.enrollment_id, data.cert_number]
    );
    return rows[0];
  }

  async findLatestCertNumberForYear(year) {
    const { rows } = await query(
      `SELECT cert_number FROM certificates
       WHERE cert_number LIKE $1
       ORDER BY cert_number DESC
       LIMIT 1`,
      [`IW-${year}-%`]
    );
    return rows[0]?.cert_number || null;
  }

  async findByCertNumber(certNumber) {
    const { rows } = await query(
      `SELECT cert.*,
              json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email,
                                'college_name', u.college_name) AS user,
              json_build_object('id', c.id, 'title', c.title, 'type', c.type) AS course
       FROM certificates cert
       LEFT JOIN users u ON u.id = cert.user_id
       LEFT JOIN enrollments e ON e.id = cert.enrollment_id
       LEFT JOIN courses c ON c.id = e.course_id
       WHERE cert.cert_number = $1`,
      [certNumber]
    );
    return rows[0] || null;
  }

  async findByUserId(userId) {
    const { rows } = await query(
      `SELECT cert.*,
              json_build_object('id', c.id, 'title', c.title, 'type', c.type) AS course
       FROM certificates cert
       LEFT JOIN enrollments e ON e.id = cert.enrollment_id
       LEFT JOIN courses c ON c.id = e.course_id
       WHERE cert.user_id = $1
       ORDER BY cert.created_at DESC`,
      [userId]
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await query(
      `SELECT cert.*,
              json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email) AS user,
              json_build_object('id', e.id, 'course_id', e.course_id, 'status', e.status) AS enrollment,
              json_build_object('id', c.id, 'title', c.title, 'type', c.type) AS course
       FROM certificates cert
       LEFT JOIN users u ON u.id = cert.user_id
       LEFT JOIN enrollments e ON e.id = cert.enrollment_id
       LEFT JOIN courses c ON c.id = e.course_id
       WHERE cert.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async approve(id) {
    const { rows } = await query(
      `UPDATE certificates SET admin_approved = TRUE, issued_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return rows[0] || null;
  }

  async listAdmin(filters, pagination) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters?.admin_approved !== undefined) {
      conditions.push(`cert.admin_approved = $${idx}`);
      values.push(filters.admin_approved);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const skip = pagination?.skip ?? 0;
    const take = pagination?.take ?? 10;
    values.push(take, skip);

    const { rows } = await query(
      `SELECT cert.*,
              json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email) AS user,
              json_build_object('id', c.id, 'title', c.title) AS course
       FROM certificates cert
       LEFT JOIN users u ON u.id = cert.user_id
       LEFT JOIN enrollments e ON e.id = cert.enrollment_id
       LEFT JOIN courses c ON c.id = e.course_id
       ${where}
       ORDER BY cert.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );
    return rows;
  }

  async countAdmin(filters) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters?.admin_approved !== undefined) {
      conditions.push(`admin_approved = $${idx}`);
      values.push(filters.admin_approved);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM certificates ${where}`,
      values
    );
    return rows[0].total;
  }

  async updateHardCopyStatus(requestId, status) {
    const extra = status === 'dispatched' ? ', dispatched_at = NOW()'
                : status === 'delivered' ? ', delivered_at = NOW()'
                : '';
    const { rows } = await query(
      `UPDATE certificate_hard_copy_requests SET status = $1${extra}
       WHERE id = $2
       RETURNING *`,
      [status, requestId]
    );
    return rows[0] || null;
  }

  async findHardCopyRequestById(requestId) {
    const { rows } = await query(
      `SELECT * FROM certificate_hard_copy_requests WHERE id = $1`,
      [requestId]
    );
    return rows[0] || null;
  }

  async createHardCopyRequest(data) {
    const { rows } = await query(
      `INSERT INTO certificate_hard_copy_requests (certificate_id, user_id, shipping_fee, shipping_address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.certificate_id, data.user_id, data.shipping_fee, data.shipping_address]
    );
    return rows[0];
  }
}
