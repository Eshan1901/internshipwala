/**
 * PgModuleProgressRepository — PostgreSQL Implementation
 *
 * Implements IModuleProgressRepository using the pg connection pool.
 * Uses ON CONFLICT for upsert operations.
 */

import { IModuleProgressRepository } from '../interfaces/IModuleProgressRepository.js';
import { query } from '../../config/database.js';

export class PgModuleProgressRepository extends IModuleProgressRepository {
  async upsertCompletion(userId, moduleId, enrollmentId) {
    const { rows } = await query(
      `INSERT INTO module_progress (user_id, module_id, enrollment_id, is_completed, progress_percent, completed_at)
       VALUES ($1, $2, $3, TRUE, 100, NOW())
       ON CONFLICT (enrollment_id, module_id)
       DO UPDATE SET is_completed = TRUE, progress_percent = 100, completed_at = NOW()
       RETURNING *`,
      [userId, moduleId, enrollmentId]
    );
    return rows[0];
  }

  async getProgress(userId, enrollmentId) {
    const { rows } = await query(
      `SELECT mp.*,
              json_build_object('id', cm.id, 'module_no', cm.module_no, 'title', cm.title) AS module
       FROM module_progress mp
       LEFT JOIN course_modules cm ON cm.id = mp.module_id
       WHERE mp.user_id = $1 AND mp.enrollment_id = $2
       ORDER BY cm.module_no ASC`,
      [userId, enrollmentId]
    );
    return rows;
  }

  async countCompleted(enrollmentId) {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM module_progress
       WHERE enrollment_id = $1 AND is_completed = TRUE`,
      [enrollmentId]
    );
    return rows[0].total;
  }

  async isModuleCompleted(userId, moduleId) {
    const { rows } = await query(
      `SELECT is_completed FROM module_progress
       WHERE user_id = $1 AND module_id = $2 AND is_completed = TRUE
       LIMIT 1`,
      [userId, moduleId]
    );
    return rows.length > 0;
  }

  async upsertSubmission(data) {
    const { rows } = await query(
      `INSERT INTO assignment_submissions (user_id, assignment_id, enrollment_id, answer_text, file_url)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (enrollment_id, assignment_id)
       DO UPDATE SET answer_text = COALESCE($4, assignment_submissions.answer_text),
                     file_url = COALESCE($5, assignment_submissions.file_url),
                     submitted_at = NOW()
       RETURNING *`,
      [data.user_id, data.assignment_id, data.enrollment_id,
       data.answer_text || null, data.file_url || null]
    );
    return rows[0];
  }
}
