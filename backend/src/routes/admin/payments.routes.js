/**
 * Admin Payment Routes
 *
 * Mounted under /api/admin/payments by admin/index.js.
 * authenticateAdmin is already applied by the parent admin router.
 *
 * Routes (from Backend-Architecture.md §4.5):
 *   GET   /api/admin/payments
 *   PATCH /api/admin/payments/:id/confirm
 *   PATCH /api/admin/payments/:id/reject
 *   POST  /api/admin/payments/:id/refund
 *
 * Permission used: APPROVE_PAYMENTS (from constants/permissions.js)
 * Matches Database-Design.md §10.3 seed: ('Approve Payments', 'payments', 'update')
 */

import { Router } from 'express';

import { PgPaymentRepository } from '../../repositories/pg/PgPaymentRepository.js';
import { PgNotificationRepository } from '../../repositories/pg/PgNotificationRepository.js';
import { PaymentService } from '../../services/payment.service.js';
import { NotificationService } from '../../services/notification.service.js';
import { PaymentController } from '../../controllers/payment.controller.js';
import authorizePermission from '../../middlewares/authorizePermission.js';
import { validate } from '../../middlewares/validate.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { PERMISSIONS } from '../../constants/permissions.js';

import {
  adminListPaymentsQuerySchema,
  confirmPaymentSchema,
  refundSchema,
  paymentIdParamSchema,
} from '../../validators/payment.validator.js';

// ── Dependency injection ──────────────────────────────────────────────────────
const paymentRepo = new PgPaymentRepository();
const notificationRepo = new PgNotificationRepository();

const notificationService = new NotificationService(notificationRepo);
const paymentService = new PaymentService(paymentRepo, notificationService);
const paymentController = new PaymentController(paymentService);

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

// GET /api/admin/payments — any authenticated admin can view
router.get(
  '/',
  validate(adminListPaymentsQuerySchema, 'query'),
  asyncHandler(paymentController.adminList)
);

// PATCH /api/admin/payments/:id/confirm — requires APPROVE_PAYMENTS permission
router.patch(
  '/:id/confirm',
  authorizePermission(PERMISSIONS.APPROVE_PAYMENTS),
  validate(paymentIdParamSchema, 'params'),
  validate(confirmPaymentSchema),
  asyncHandler(paymentController.adminConfirm)
);

// PATCH /api/admin/payments/:id/reject — requires APPROVE_PAYMENTS permission
router.patch(
  '/:id/reject',
  authorizePermission(PERMISSIONS.APPROVE_PAYMENTS),
  validate(paymentIdParamSchema, 'params'),
  asyncHandler(paymentController.adminReject)
);

// POST /api/admin/payments/:id/refund — requires PROCESS_REFUNDS permission
router.post(
  '/:id/refund',
  authorizePermission(PERMISSIONS.PROCESS_REFUNDS),
  validate(paymentIdParamSchema, 'params'),
  validate(refundSchema),
  asyncHandler(paymentController.adminRefund)
);

export default router;
