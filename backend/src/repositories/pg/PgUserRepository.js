/**
 * PgUserRepository — PostgreSQL Implementation
 *
 * Implements IUserRepository using the pg connection pool.
 * Soft-delete rule: all reads exclude deleted_at IS NOT NULL.
 */

import { IUserRepository } from '../interfaces/IUserRepository.js';
import { query } from '../../config/database.js';

export class PgUserRepository extends IUserRepository {
  async create(data) {
    const { rows } = await query(
      `INSERT INTO users (full_name, email, mobile, password_hash, college_name, present_course, year_qualifying, state, referral_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, full_name, email, mobile, profile_photo_url, dob, address, city, state, country,
                 father_name, present_course, branch, year_qualifying, college_name, referral_code,
                 is_verified, is_active, last_login_at, created_at, updated_at`,
      [
        data.full_name, data.email, data.mobile, data.password_hash,
        data.college_name || null, data.present_course || null,
        data.year_qualifying || null, data.state || null,
        data.referral_code || null,
      ]
    );
    return rows[0];
  }

  async findByEmail(email) {
    const { rows } = await query(
      `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );
    return rows[0] || null;
  }

  async findByMobile(mobile) {
    const { rows } = await query(
      `SELECT * FROM users WHERE mobile = $1 AND deleted_at IS NULL`,
      [mobile]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const { rows } = await query(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
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
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL
       RETURNING id, full_name, email, mobile, profile_photo_url, dob, address, city, state, country,
                 father_name, present_course, branch, year_qualifying, college_name, referral_code,
                 is_verified, is_active, last_login_at, created_at, updated_at`,
      values
    );
    return rows[0] || null;
  }

  async softDelete(id) {
    await query(
      `UPDATE users SET deleted_at = NOW(), is_active = FALSE WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
  }

  async updateLastLogin(id) {
    await query(
      `UPDATE users SET last_login_at = NOW() WHERE id = $1`,
      [id]
    );
  }

  async list(filters, pagination) {
    const conditions = ['deleted_at IS NULL'];
    const values = [];
    let idx = 1;

    if (filters?.is_active !== undefined) {
      conditions.push(`is_active = $${idx}`);
      values.push(filters.is_active);
      idx++;
    }

    if (filters?.search) {
      conditions.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx} OR mobile ILIKE $${idx})`);
      values.push(`%${filters.search}%`);
      idx++;
    }

    const skip = pagination?.skip ?? 0;
    const take = pagination?.take ?? 10;

    values.push(take, skip);
    const { rows } = await query(
      `SELECT id, full_name, email, mobile, profile_photo_url, is_verified, is_active, college_name,
              present_course, created_at, last_login_at
       FROM users
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );
    return rows;
  }

  async count(filters) {
    const conditions = ['deleted_at IS NULL'];
    const values = [];
    let idx = 1;

    if (filters?.is_active !== undefined) {
      conditions.push(`is_active = $${idx}`);
      values.push(filters.is_active);
      idx++;
    }

    if (filters?.search) {
      conditions.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx} OR mobile ILIKE $${idx})`);
      values.push(`%${filters.search}%`);
      idx++;
    }

    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM users WHERE ${conditions.join(' AND ')}`,
      values
    );
    return rows[0].total;
  }
}
