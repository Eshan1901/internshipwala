/**
 * PgCourseRepository — PostgreSQL Implementation
 *
 * Implements ICourseRepository using the pg connection pool.
 * Replaces MockCourseRepository.
 */

import { ICourseRepository } from '../interfaces/ICourseRepository.js';
import { query } from '../../config/database.js';

export class PgCourseRepository extends ICourseRepository {
  async listPublic(filters, pagination) {
    const conditions = ["c.status = 'published'", 'c.deleted_at IS NULL'];
    const values = [];
    let idx = 1;

    if (filters?.category_id) {
      conditions.push(`c.category_id = $${idx}`);
      values.push(filters.category_id);
      idx++;
    }

    if (filters?.type) {
      conditions.push(`c.type = $${idx}`);
      values.push(filters.type);
      idx++;
    }

    const skip = pagination?.skip ?? 0;
    const take = pagination?.take ?? 10;

    values.push(take, skip);
    const { rows } = await query(
      `SELECT c.*,
              json_build_object('id', cc.id, 'name', cc.name, 'slug', cc.slug,
                                'department', cc.department, 'colour_code', cc.colour_code) AS category
       FROM courses c
       LEFT JOIN course_categories cc ON cc.id = c.category_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY c.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );
    return rows;
  }

  async countPublic(filters) {
    const conditions = ["c.status = 'published'", 'c.deleted_at IS NULL'];
    const values = [];
    let idx = 1;

    if (filters?.category_id) {
      conditions.push(`c.category_id = $${idx}`);
      values.push(filters.category_id);
      idx++;
    }

    if (filters?.type) {
      conditions.push(`c.type = $${idx}`);
      values.push(filters.type);
      idx++;
    }

    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM courses c WHERE ${conditions.join(' AND ')}`,
      values
    );
    return rows[0].total;
  }

  async findPublicById(id) {
    // Fetch the course with its category
    const { rows: courseRows } = await query(
      `SELECT c.*,
              json_build_object('id', cc.id, 'name', cc.name, 'slug', cc.slug,
                                'department', cc.department, 'colour_code', cc.colour_code) AS category
       FROM courses c
       LEFT JOIN course_categories cc ON cc.id = c.category_id
       WHERE c.id = $1 AND c.status = 'published' AND c.deleted_at IS NULL`,
      [id]
    );

    if (courseRows.length === 0) return null;

    const course = courseRows[0];

    // Fetch modules
    const { rows: modules } = await query(
      `SELECT id, course_id, module_no, title, description, content_url, content_type, is_active
       FROM course_modules
       WHERE course_id = $1 AND is_active = TRUE
       ORDER BY module_no ASC`,
      [id]
    );

    // Fetch duration fees
    const { rows: fees } = await query(
      `SELECT id, course_id, duration_weeks, label, fee, is_active
       FROM course_duration_fees
       WHERE course_id = $1 AND is_active = TRUE`,
      [id]
    );

    course.course_modules = modules;
    course.course_duration_fees = fees;

    return course;
  }

  async listActiveCategories() {
    const { rows } = await query(
      `SELECT id, name, slug, department, icon_url, colour_code, display_order, is_active
       FROM course_categories
       WHERE is_active = TRUE
       ORDER BY display_order ASC`
    );
    return rows;
  }
}
