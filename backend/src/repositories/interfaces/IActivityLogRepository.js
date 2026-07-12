/**
 * IActivityLogRepository — Activity Log Repository Interface (Contract)
 *
 * Defines every data-access method the application layer requires for the
 * `activity_logs` table. This table is append-only — rows are never updated
 * or deleted. It forms the admin audit trail.
 *
 * From Backend-Architecture.md Section 13.3:
 *   Fields: admin_user_id, action, entity_type, entity_id,
 *           before_data, after_data, ip_address, created_at
 */

export class IActivityLogRepository {
  /**
   * Append a new activity log entry.
   * This is the only write operation — activity logs are immutable once created.
   *
   * @param {{
   *   admin_user_id: string,
   *   action: string,
   *   entity_type?: string,
   *   entity_id?: string,
   *   before_data?: object,
   *   after_data?: object,
   *   ip_address?: string
   * }} data
   * @returns {Promise<object>} Created activity log record
   */
  // eslint-disable-next-line no-unused-vars
  async create(data) { throw new Error('IActivityLogRepository.create not implemented'); }

  /**
   * List activity log entries with optional filters and pagination.
   *
   * @param {{ admin_user_id?: string, entity_type?: string, action?: string }} filters
   * @param {{ skip: number, take: number }} pagination
   * @returns {Promise<object[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async list(filters, pagination) { throw new Error('IActivityLogRepository.list not implemented'); }

  /**
   * Count activity log entries matching optional filters.
   *
   * @param {{ admin_user_id?: string, entity_type?: string, action?: string }} filters
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line no-unused-vars
  async count(filters) { throw new Error('IActivityLogRepository.count not implemented'); }
}
