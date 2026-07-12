/**
 * Notification Controller
 *
 * HTTP boundary for notification operations.
 * No business logic. No direct data access.
 * Responsibilities: parse request → call NotificationService → return response.
 *
 * Endpoints (from Backend-Architecture.md Section 18.12):
 *   GET   /api/notifications               — list student's notifications
 *   PATCH /api/notifications/:id/read      — mark one notification as read
 *   PATCH /api/notifications/read-all      — mark all notifications as read
 *   POST  /api/admin/notifications/send    — admin bulk send
 */

import { sendSuccess } from '../utils/response.js';
import { MESSAGES } from '../constants/messages.js';

export class NotificationController {
  /**
   * @param {import('../services/notification.service.js').NotificationService} notificationService
   */
  constructor(notificationService) {
    this.notificationService = notificationService;
  }

  /**
   * GET /api/notifications
   * Returns the authenticated student's notifications, newest first, paginated.
   */
  list = async (req, res, next) => {
    try {
      const { notifications, meta } = await this.notificationService.listForUser(
        req.user.id,
        req.query
      );
      return sendSuccess(res, 200, MESSAGES.NOTIFICATIONS_FETCHED, notifications, meta);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * PATCH /api/notifications/:id/read
   * Marks a single notification as read. Verifies ownership in the service layer.
   */
  markRead = async (req, res, next) => {
    try {
      await this.notificationService.markRead(req.user.id, req.params.id);
      return sendSuccess(res, 200, MESSAGES.NOTIFICATION_READ);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * PATCH /api/notifications/read-all
   * Marks all unread notifications as read for the authenticated student.
   */
  markAllRead = async (req, res, next) => {
    try {
      await this.notificationService.markAllRead(req.user.id);
      return sendSuccess(res, 200, MESSAGES.ALL_NOTIFICATIONS_READ);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * POST /api/admin/notifications/send
   * Admin-initiated notification send to a specific student.
   */
  adminSend = async (req, res, next) => {
    try {
      const notification = await this.notificationService.adminSend(req.body);
      return sendSuccess(res, 201, MESSAGES.NOTIFICATION_SENT, notification);
    } catch (err) {
      return next(err);
    }
  };
}
