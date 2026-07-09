/**
 * IModuleProgressRepository — Module Progress Repository Interface (Contract)
 *
 * Defines every data-access method the application layer requires for
 * the `module_progress` and `assignment_submissions` tables.
 * The database developer implements this contract using Prisma.
 *
 * Tables:
 *   module_progress       (Database-Design.md §5.14)
 *   assignment_submissions (Database-Design.md §5.15)
 *
 * module_progress uniqueness: UNIQUE (enrollment_id, module_id)
 * assignment_submissions uniqueness: UNIQUE (enrollment_id, assignment_id)
 */

export class IModuleProgressRepository {
  /**
   * Upsert a module completion record.
   * If the record exists, set is_completed=TRUE and completed_at=NOW().
   * If it does not exist, create it with is_completed=TRUE.
   *
   * From Backend-Architecture.md §6.7:
   *   "upsert with is_completed=TRUE, completed_at=NOW()"
   *
   * @param {string} userId
   * @param {string} moduleId
   * @param {string} enrollmentId
   * @returns {Promise<object>} Upserted progress record
   */
  // eslint-disable-next-line no-unused-vars
  async upsertCompletion(userId, moduleId, enrollmentId) { throw new Error('IModuleProgressRepository.upsertCompletion not implemented'); }

  /**
   * Get all progress records for a specific enrollment.
   * @param {string} userId
   * @param {string} enrollmentId
   * @returns {Promise<object[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async getProgress(userId, enrollmentId) { throw new Error('IModuleProgressRepository.getProgress not implemented'); }

  /**
   * Count completed modules for a specific enrollment.
   * @param {string} enrollmentId
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line no-unused-vars
  async countCompleted(enrollmentId) { throw new Error('IModuleProgressRepository.countCompleted not implemented'); }

  /**
   * Check whether a specific module is marked complete for a user.
   * Used for sequential module gating.
   * @param {string} userId
   * @param {string} moduleId
   * @returns {Promise<boolean>}
   */
  // eslint-disable-next-line no-unused-vars
  async isModuleCompleted(userId, moduleId) { throw new Error('IModuleProgressRepository.isModuleCompleted not implemented'); }

  /**
   * Upsert an assignment submission.
   * One submission per assignment per enrollment (UNIQUE constraint).
   * @param {{ user_id: string, assignment_id: string, enrollment_id: string, answer_text?: string, file_url?: string }} data
   * @returns {Promise<object>} Upserted submission record
   */
  // eslint-disable-next-line no-unused-vars
  async upsertSubmission(data) { throw new Error('IModuleProgressRepository.upsertSubmission not implemented'); }
}
