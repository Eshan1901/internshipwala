/**
 * Notification Service
 *
 * All business logic for student notifications.
 * Depends exclusively on INotificationRepository — no Prisma, no Express objects.
 *
 * Methods (from Backend-Architecture.md Section 5.6):
 *   send(userId, title, message, type)
 *   listForUser(userId, rawQuery)
 *   markRead(userId, notificationId)
 *   markAllRead(userId)
 *   adminSend(dto)
 *
 * Business rules enforced here (from Section 3.9):
 *   - Notifications are per-user
 *   - markRead verifies the notification belongs to the requesting user
 *
 * This service is consumed by:
 *   - EnrollmentService (Phase 10)
 *   - PaymentService    (Phase 11)
 *   - CertificateService (Phase 12)
 * It is injected as a dependency into those services via constructor injection.
 */

import { AppError } from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';
import { parsePaginationQuery, buildPaginationMeta } from '../utils/pagination.js';
import logger from '../logger/logger.js';

export class NotificationService {
  /**
   * @param {import('../repositories/interfaces/INotificationRepository.js').INotificationRepository} notificationRepo
   */
  constructor(notificationRepo) {
    this.notificationRepo = notificationRepo;
  }

  // ── Send a notification ────────────────────────────────────────────────────

  /**
   * Insert a notification record for a single student.
   * Called internally by other services (Enrollment, Payment, Certificate).
   *
   * From Backend-Architecture.md Section 5.6:
   *   "Insert into notifications; optionally send email via MailService"
   * Email sending is a future enhancement — v1 inserts the DB record only.
   *
   * @param {string} userId
   * @param {string} title
   * @param {string} message
   * @param {string} [type] - e.g. 'enrollment', 'payment', 'certificate', 'announcement'
   * @returns {Promise<object>} Created notification record
   */
  async send(userId, title, message, type) {
    const notification = await this.notificationRepo.create({
      user_id: userId,
      title,
      message,
      type,
    });

    logger.info('Notification sent', { userId, type });

    return notification;
  }

  // ── List notifications for a student ──────────────────────────────────────

  /**
   * Fetch the authenticated student's notifications, newest first.
   *
   * From Backend-Architecture.md Section 5.6:
   *   "Fetch notifications ordered by created_at DESC; paginate"
   *
   * @param {string} userId
   * @param {object} rawQuery - Express req.query (page, limit)
   * @returns {Promise<{ notifications: object[], meta: object }>}
   */
  async listForUser(userId, rawQuery) {
    const { page, limit, skip, take } = parsePaginationQuery(rawQuery);

    const [notifications, total] = await Promise.all([
      this.notificationRepo.listByUser(userId, { skip, take }),
      this.notificationRepo.countByUser(userId),
    ]);

    return {
      notifications,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  // ── Mark a single notification as read ────────────────────────────────────

  /**
   * Set is_read = TRUE on one notification.
   * Verifies the notification belongs to the requesting user before updating.
   *
   * From Backend-Architecture.md Section 5.6:
   *   "Set is_read=TRUE; verify ownership"
   *
   * @param {string} userId
   * @param {string} notificationId
   * @returns {Promise<void>}
   */
  async markRead(userId, notificationId) {
    const notification = await this.notificationRepo.findById(notificationId);

    if (!notification) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    if (notification.user_id !== userId) {
      throw new AppError(403, MESSAGES.FORBIDDEN);
    }

    await this.notificationRepo.markRead(notificationId);

    logger.info('Notification marked as read', { userId, notificationId });
  }

  // ── Mark all notifications as read ────────────────────────────────────────

  /**
   * Bulk-set is_read = TRUE for every unread notification belonging to a user.
   *
   * From Backend-Architecture.md Section 5.6:
   *   "Bulk update is_read=TRUE WHERE user_id = userId AND is_read = FALSE"
   *
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async markAllRead(userId) {
    await this.notificationRepo.markAllRead(userId);

    logger.info('All notifications marked as read', { userId });
  }

  // ── Admin: send a notification to a specific student ──────────────────────

  /**
   * Admin-initiated notification send.
   * Creates a notification record for the specified student.
   *
   * From Backend-Architecture.md Section 18.12:
   *   POST /api/admin/notifications/send — Admin (bulk send)
   *
   * @param {{ user_id: string, title: string, message: string, type?: string }} dto
   * @returns {Promise<object>} Created notification record
   */
  async adminSend(dto) {
    const notification = await this.notificationRepo.create({
      user_id: dto.user_id,
      title: dto.title,
      message: dto.message,
      type: dto.type,
    });

    logger.info('Admin sent notification', { targetUserId: dto.user_id, type: dto.type });

    return notification;
  }
}
