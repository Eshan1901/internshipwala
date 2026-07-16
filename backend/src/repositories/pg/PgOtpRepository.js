/**
 * PgOtpRepository — PostgreSQL Implementation
 *
 * Implements IOtpRepository using the pg connection pool.
 */

import { IOtpRepository } from '../interfaces/IOtpRepository.js';
import { query } from '../../config/database.js';

export class PgOtpRepository extends IOtpRepository {
  async create(data) {
    const { rows } = await query(
      `INSERT INTO otp_verifications (target, otp_code, purpose, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.target, data.otp_code, data.purpose, data.expires_at]
    );
    return rows[0];
  }

  async findValid(target, purpose, otp_code) {
    const { rows } = await query(
      `SELECT * FROM otp_verifications
       WHERE target = $1 AND purpose = $2 AND otp_code = $3
         AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [target, purpose, otp_code]
    );
    return rows[0] || null;
  }

  async markUsed(id) {
    await query(
      `UPDATE otp_verifications SET is_used = TRUE WHERE id = $1`,
      [id]
    );
  }

  async invalidateOld(target, purpose) {
    await query(
      `UPDATE otp_verifications SET is_used = TRUE
       WHERE target = $1 AND purpose = $2 AND is_used = FALSE`,
      [target, purpose]
    );
  }

  async deleteExpired() {
    const { rowCount } = await query(
      `DELETE FROM otp_verifications WHERE expires_at < NOW()`
    );
    return rowCount;
  }
}
