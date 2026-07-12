/**
 * Admin Enrollment Routes
 *
 * Mounted under /api/admin/enrollments by admin/index.js.
 * authenticateAdmin is already applied by the parent admin router.
 *
 * Routes (from Backend-Architecture.md §4.4):
 *   GET   /api/admin/enrollments
 *   PATCH /api/admin/enrollments/:id/activate
 *   PATCH /api/admin/enrollments/:id/cancel
 */

import { Router } from 'express';

import { IEnrollmentRepository } from '../../repositories/interfaces/IEnrollmentRepository.js';
import { IModuleProgressRepository } from '../../repositories/interfaces/IModuleProgressRepository.js';
import { INotificationRepository } from '../../repositories/interfaces/INotificationRepository.js';
import { ICertificateRepository } from '../../repositories/interfaces/ICertificateRepository.js';
import { MockCourseRepository } from '../../repositories/mocks/MockCourseRepository.js';

import { EnrollmentService } from '../../services/enrollment.service.js';
import { NotificationService } from '../../services/notification.service.js';
import { CertificateService } from '../../services/certificate.service.js';
import { EnrollmentController } from '../../controllers/enrollment.controller.js';
import { validate } from '../../middlewares/validate.js';
import asyncHandler from '../../utils/asyncHandler.js';

import {
  adminListEnrollmentsQuerySchema,
  enrollmentIdParamSchema,
} from '../../validators/enrollment.validator.js';

// ── Dependency injection ──────────────────────────────────────────────────────
const enrollmentRepo = new IEnrollmentRepository();
const progressRepo = new IModuleProgressRepository();
const courseRepo = new MockCourseRepository();
const notificationRepo = new INotificationRepository();
const certRepo = new ICertificateRepository();

const notificationService = new NotificationService(notificationRepo);
const certificateService = new CertificateService(certRepo, notificationService);
const enrollmentService = new EnrollmentService(
  enrollmentRepo,
  progressRepo,
  courseRepo,
  notificationService,
  certificateService
);
const enrollmentController = new EnrollmentController(enrollmentService);

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

// GET /api/admin/enrollments
router.get(
  '/',
  validate(adminListEnrollmentsQuerySchema, 'query'),
  asyncHandler(enrollmentController.adminList)
);

// PATCH /api/admin/enrollments/:id/activate
router.patch(
  '/:id/activate',
  validate(enrollmentIdParamSchema, 'params'),
  asyncHandler(enrollmentController.adminActivate)
);

// PATCH /api/admin/enrollments/:id/cancel
router.patch(
  '/:id/cancel',
  validate(enrollmentIdParamSchema, 'params'),
  asyncHandler(enrollmentController.adminCancel)
);

export default router;
