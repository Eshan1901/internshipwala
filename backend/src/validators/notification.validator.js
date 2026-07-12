/**
 * Notification Validators
 *
 * Zod schemas for notification endpoints.
 * Rules derived from Backend-Architecture.md Section 18.12 and
 * Database-Design.md Section 5.35 (notifications table).
 */

import { z } from 'zod';
import { zUuid, zPage, zLimit, zString } from './common.js';

/**
 * GET /api/notifications — query params
 */
export const listNotificationsQuerySchema = z.object({
  page: zPage,
  limit: zLimit,
});

/**
 * PATCH /api/notifications/:id/read — route param
 */
export const notificationIdParamSchema = z.object({
  id: zUuid,
});

/**
 * POST /api/admin/notifications/send — request body
 *
 * Sends a notification to a specific student (user_id required).
 * type must match the documented values: enrollment, certificate, payment, announcement.
 * From Database-Design.md Section 5.35: type VARCHAR(50) nullable.
 */
export const adminSendNotificationSchema = z.object({
  user_id: zUuid,

  title: zString
    .max(200, 'Title must be at most 200 characters.'),

  message: zString
    .min(1, 'Message is required.'),

  type: z
    .enum(['enrollment', 'certificate', 'payment', 'announcement'], {
      errorMap: () => ({
        message: "Type must be one of: enrollment, certificate, payment, announcement.",
      }),
    })
    .optional(),
}).strict();
