/**
 * Notification Routes — Student-facing
 *
 * All routes require student JWT authentication.
 * Dependency injection: INotificationRepository → NotificationService → NotificationController.
 *
 * When the database developer delivers NotificationRepository (Prisma implementation),
 * replace `INotificationRepository` with `NotificationRepository` — nothing else changes.
 *
 * Routes (from Backend-Architecture.md Section 18.12):
 *   GET   /api/notifications               — list own notifications
 *   PATCH /api/notifications/read-all      — mark all as read
 *   PATCH /api/notifications/:id/read      — mark one as read
 *
 * Note: /read-all must be registered before /:id/read so Express does not
 * interpret "read-all" as a UUID value for the :id param.
 */

import { Router } from 'express';

import { PgNotificationRepository } from '../repositories/pg/PgNotificationRepository.js';
import { PgUserRepository } from '../repositories/pg/PgUserRepository.js';
import { NotificationService } from '../services/notification.service.js';
import { NotificationController } from '../controllers/notification.controller.js';
import authenticate from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import asyncHandler from '../utils/asyncHandler.js';

import {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
} from '../validators/notification.validator.js';

// ── Dependency injection ──────────────────────────────────────────────────────
const notificationRepo = new PgNotificationRepository();
const notificationService = new NotificationService(notificationRepo);
const notificationController = new NotificationController(notificationService);

// authenticate requires a userRepo to resolve the JWT subject
const userRepo = new PgUserRepository();
const authMiddleware = authenticate(userRepo);

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

// All notification routes require a valid student JWT
router.use(authMiddleware);

// GET /api/notifications
router.get(
  '/',
  validate(listNotificationsQuerySchema, 'query'),
  asyncHandler(notificationController.list)
);

// PATCH /api/notifications/read-all — must be before /:id/read
router.patch(
  '/read-all',
  asyncHandler(notificationController.markAllRead)
);

// PATCH /api/notifications/:id/read
router.patch(
  '/:id/read',
  validate(notificationIdParamSchema, 'params'),
  asyncHandler(notificationController.markRead)
);

export default router;
