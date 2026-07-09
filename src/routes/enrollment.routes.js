/**
 * Enrollment Routes — Student-facing
 *
 * All routes require student JWT authentication.
 * Dependency injection: repositories → EnrollmentService → EnrollmentController.
 *
 * Routes (from Backend-Architecture.md §4.4):
 *   POST  /api/enrollments
 *   GET   /api/enrollments/mine
 *   GET   /api/enrollments/:id/modules
 *   POST  /api/enrollments/:id/modules/:moduleId/complete
 *   POST  /api/enrollments/:id/assignments/:assignmentId/submit
 *
 * Note: /mine must be registered before /:id/* routes so Express does not
 * interpret "mine" as a UUID value for the :id param.
 */

import { Router } from 'express';

import { IEnrollmentRepository } from '../repositories/interfaces/IEnrollmentRepository.js';
import { IModuleProgressRepository } from '../repositories/interfaces/IModuleProgressRepository.js';
import { IUserRepository } from '../repositories/interfaces/IUserRepository.js';
import { INotificationRepository } from '../repositories/interfaces/INotificationRepository.js';
import { ICertificateRepository } from '../repositories/interfaces/ICertificateRepository.js';
import { MockCourseRepository } from '../repositories/mocks/MockCourseRepository.js';

import { EnrollmentService } from '../services/enrollment.service.js';
import { NotificationService } from '../services/notification.service.js';
import { CertificateService } from '../services/certificate.service.js';
import { EnrollmentController } from '../controllers/enrollment.controller.js';
import authenticate from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import asyncHandler from '../utils/asyncHandler.js';

import {
  enrollSchema,
  myEnrollmentsQuerySchema,
  enrollmentIdParamSchema,
  enrollmentModuleParamSchema,
  enrollmentAssignmentParamSchema,
  submitAssignmentSchema,
} from '../validators/enrollment.validator.js';

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

const userRepo = new IUserRepository();
const authMiddleware = authenticate(userRepo);

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

// All enrollment routes require a valid student JWT
router.use(authMiddleware);

// POST /api/enrollments
router.post(
  '/',
  validate(enrollSchema),
  asyncHandler(enrollmentController.enroll)
);

// GET /api/enrollments/mine — must be before /:id routes
router.get(
  '/mine',
  validate(myEnrollmentsQuerySchema, 'query'),
  asyncHandler(enrollmentController.myEnrollments)
);

// GET /api/enrollments/:id/modules
router.get(
  '/:id/modules',
  validate(enrollmentIdParamSchema, 'params'),
  asyncHandler(enrollmentController.getModules)
);

// POST /api/enrollments/:id/modules/:moduleId/complete
router.post(
  '/:id/modules/:moduleId/complete',
  validate(enrollmentModuleParamSchema, 'params'),
  asyncHandler(enrollmentController.markModuleComplete)
);

// POST /api/enrollments/:id/assignments/:assignmentId/submit
router.post(
  '/:id/assignments/:assignmentId/submit',
  validate(enrollmentAssignmentParamSchema, 'params'),
  validate(submitAssignmentSchema),
  asyncHandler(enrollmentController.submitAssignment)
);

export default router;
