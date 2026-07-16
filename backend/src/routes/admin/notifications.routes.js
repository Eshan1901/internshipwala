/**
 * Admin Notification Routes
 *
 * Mounted under /api/admin/notifications by admin/index.js.
 * authenticateAdmin is already applied by the parent admin router —
 * no need to apply it again here.
 *
 * Routes (from Backend-Architecture.md Section 18.12):
 *   POST /api/admin/notifications/send — Admin JWT + SEND_NOTIFICATIONS permission
 *
 * Dependency injection follows the same pattern as admin/index.js:
 * repositories are instantiated here and injected into service and controller.
 */

import { Router } from 'express';

import { PgNotificationRepository } from '../../repositories/pg/PgNotificationRepository.js';
import { NotificationService } from '../../services/notification.service.js';
import { NotificationController } from '../../controllers/notification.controller.js';
import authorizePermission from '../../middlewares/authorizePermission.js';
import { validate } from '../../middlewares/validate.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { PERMISSIONS } from '../../constants/permissions.js';

import { adminSendNotificationSchema } from '../../validators/notification.validator.js';

// ── Dependency injection ──────────────────────────────────────────────────────
const notificationRepo = new PgNotificationRepository();
const notificationService = new NotificationService(notificationRepo);
const notificationController = new NotificationController(notificationService);

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

// POST /api/admin/notifications/send
router.post(
  '/send',
  authorizePermission(PERMISSIONS.SEND_NOTIFICATIONS),
  validate(adminSendNotificationSchema),
  asyncHandler(notificationController.adminSend)
);

export default router;
