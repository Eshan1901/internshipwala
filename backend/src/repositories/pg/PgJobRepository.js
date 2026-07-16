/**
 * PgJobRepository — PostgreSQL Implementation
 *
 * Implements IJobRepository using the pg connection pool.
 * Soft-delete: job_listings uses deleted_at.
 * Expiry rule: public queries filter deadline IS NULL OR deadline >= CURRENT_DATE.
 */

import { IJobRepository } from '../interfaces/IJobRepository.js';
import { query } from '../../config/database.js';

export class PgJobRepository extends IJobRepository {
  async listActive(filters, pagination) {
    const conditions = [
      'jl.is_active = TRUE',
      'jl.deleted_at IS NULL',
      '(jl.deadline IS NULL OR jl.deadline >= CURRENT_DATE)',
    ];
    const values = [];
    let idx = 1;

    if (filters?.listing_type) {
      conditions.push(`jl.listing_type = $${idx}`);
      values.push(filters.listing_type);
      idx++;
    }

    const skip = pagination?.skip ?? 0;
    const take = pagination?.take ?? 10;
    values.push(take, skip);

    const { rows } = await query(
      `SELECT jl.*
       FROM job_listings jl
       WHERE ${conditions.join(' AND ')}
       ORDER BY jl.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );
    return rows;
  }

  async countActive(filters) {
    const conditions = [
      'is_active = TRUE',
      'deleted_at IS NULL',
      '(deadline IS NULL OR deadline >= CURRENT_DATE)',
    ];
    const values = [];
    let idx = 1;

    if (filters?.listing_type) {
      conditions.push(`listing_type = $${idx}`);
      values.push(filters.listing_type);
      idx++;
    }

    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM job_listings WHERE ${conditions.join(' AND ')}`,
      values
    );
    return rows[0].total;
  }

  async findById(id) {
    const { rows } = await query(
      `SELECT * FROM job_listings
       WHERE id = $1 AND is_active = TRUE AND deleted_at IS NULL
         AND (deadline IS NULL OR deadline >= CURRENT_DATE)`,
      [id]
    );
    return rows[0] || null;
  }

  async findByIdAdmin(id) {
    const { rows } = await query(
      `SELECT * FROM job_listings WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async createListing(data) {
    const { rows } = await query(
      `INSERT INTO job_listings (created_by, title, listing_type, company, location,
                                  description, eligibility, apply_url, deadline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [data.created_by, data.title, data.listing_type,
       data.company || null, data.location || null,
       data.description || null, data.eligibility || null,
       data.apply_url || null, data.deadline || null]
    );
    return rows[0];
  }

  async updateListing(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }

    if (fields.length === 0) return this.findByIdAdmin(id);

    values.push(id);
    const { rows } = await query(
      `UPDATE job_listings SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0] || null;
  }

  async softDeleteListing(id) {
    await query(
      `UPDATE job_listings SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
  }

  async findApplication(userId, jobListingId) {
    const { rows } = await query(
      `SELECT * FROM job_applications WHERE user_id = $1 AND job_listing_id = $2`,
      [userId, jobListingId]
    );
    return rows[0] || null;
  }

  async createApplication(data) {
    const { rows } = await query(
      `INSERT INTO job_applications (user_id, job_listing_id, cover_note, resume_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.user_id, data.job_listing_id, data.cover_note || null, data.resume_url || null]
    );
    return rows[0];
  }

  async listApplicants(jobListingId, pagination) {
    const skip = pagination?.skip ?? 0;
    const take = pagination?.take ?? 10;

    const { rows } = await query(
      `SELECT ja.*,
              json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email,
                                'mobile', u.mobile, 'college_name', u.college_name) AS user
       FROM job_applications ja
       LEFT JOIN users u ON u.id = ja.user_id
       WHERE ja.job_listing_id = $1
       ORDER BY ja.applied_at DESC
       LIMIT $2 OFFSET $3`,
      [jobListingId, take, skip]
    );
    return rows;
  }

  async countApplicants(jobListingId) {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM job_applications WHERE job_listing_id = $1`,
      [jobListingId]
    );
    return rows[0].total;
  }

  async listAdmin(filters, pagination) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters?.listing_type) {
      conditions.push(`listing_type = $${idx}`);
      values.push(filters.listing_type);
      idx++;
    }
    if (filters?.is_active !== undefined) {
      conditions.push(`is_active = $${idx}`);
      values.push(filters.is_active);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const skip = pagination?.skip ?? 0;
    const take = pagination?.take ?? 10;
    values.push(take, skip);

    const { rows } = await query(
      `SELECT * FROM job_listings ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );
    return rows;
  }

  async countAdmin(filters) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters?.listing_type) {
      conditions.push(`listing_type = $${idx}`);
      values.push(filters.listing_type);
      idx++;
    }
    if (filters?.is_active !== undefined) {
      conditions.push(`is_active = $${idx}`);
      values.push(filters.is_active);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM job_listings ${where}`,
      values
    );
    return rows[0].total;
  }
}
