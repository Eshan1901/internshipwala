/**
 * INotificationRepository — Notification Repository Interface (Contract)
 *
 * Defines every data-access method the application layer requires for
 * the `notifications` table. The database developer implements this contract
 * using Prisma. Services depend only on this interface — never on any
 * concrete implementation.
 *
 * Table: notifications (Database-Design.md Section 5.35)
 *   id, user_id, title, message, type, is_read, created_at
 *
 * Note: notifications have no deleted_at — they are never soft-deleted.
 * Note: notifications have no updated_at — is_read is the only mutable field.
 */

export class INotificationRepository {
  /**
   * Insert a new notification record for a single user.
   * @param {{ user_id: string, title: string, message: string, type?: string }} data
   * @returns {Promise<object>} Created notification record
   */
  // eslint-disable-next-line no-unused-vars
  async create(data) { throw new Error('INotificationRepository.create not implemented'); }

  /**
   * List notifications for a user ordered by created_at DESC (newest first).
   * @param {string} userId
   * @param {{ skip: number, take: number }} pagination
   * @returns {Promise<object[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async listByUser(userId, pagination) { throw new Error('INotificationRepository.listByUser not implemented'); }

  /**
   * Count all notifications for a user.
   * @param {string} userId
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line no-unused-vars
  async countByUser(userId) { throw new Error('INotificationRepository.countByUser not implemented'); }

  /**
   * Find a single notification by its primary key.
   * Used to verify ownership before marking as read.
   * @param {string} id - UUID
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findById(id) { throw new Error('INotificationRepository.findById not implemented'); }

  /**
   * Set is_read = TRUE on a single notification.
   * @param {string} id - UUID
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async markRead(id) { throw new Error('INotificationRepository.markRead not implemented'); }

  /**
   * Bulk-set is_read = TRUE for all unread notifications belonging to a user.
   * @param {string} userId
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async markAllRead(userId) { throw new Error('INotificationRepository.markAllRead not implemented'); }
}
