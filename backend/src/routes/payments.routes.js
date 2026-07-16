/**
 * Payment Routes — Student-facing
 *
 * All routes require student JWT authentication.
 * Dependency injection: IPaymentRepository → PaymentService → PaymentController.
 *
 * Routes (from Backend-Architecture.md §4.5):
 *   GET /api/payments/mine — student's own payment history
 */

import { Router } from 'express';

import { PgPaymentRepository } from '../repositories/pg/PgPaymentRepository.js';
import { PgNotificationRepository } from '../repositories/pg/PgNotificationRepository.js';
import { PgUserRepository } from '../repositories/pg/PgUserRepository.js';
import { PaymentService } from '../services/payment.service.js';
import { NotificationService } from '../services/notification.service.js';
import { PaymentController } from '../controllers/payment.controller.js';
import authenticate from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import asyncHandler from '../utils/asyncHandler.js';

import { myPaymentsQuerySchema } from '../validators/payment.validator.js';

// ── Dependency injection ──────────────────────────────────────────────────────
const paymentRepo = new PgPaymentRepository();
const notificationRepo = new PgNotificationRepository();

const notificationService = new NotificationService(notificationRepo);
const paymentService = new PaymentService(paymentRepo, notificationService);
const paymentController = new PaymentController(paymentService);

const userRepo = new PgUserRepository();
const authMiddleware = authenticate(userRepo);

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

// All payment routes require a valid student JWT
router.use(authMiddleware);

// GET /api/payments/mine
router.get(
  '/mine',
  validate(myPaymentsQuerySchema, 'query'),
  asyncHandler(paymentController.myPayments)
);

export default router;
