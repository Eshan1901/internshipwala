/**
 * Admin Certificate Routes
 *
 * Mounted under /api/admin/certificates by admin/index.js.
 * authenticateAdmin is already applied by the parent admin router.
 *
 * Implemented routes (from Backend-Architecture.md §4.6):
 *   GET   /api/admin/certificates
 *   PATCH /api/admin/certificates/:id/approve
 *   PATCH /api/admin/certificates/hard-copy/:requestId
 *
 * Route ordering:
 *   /hard-copy/:requestId must come before /:id/* to avoid Express
 *   treating "hard-copy" as a UUID value for :id.
 *
 * Permission: APPROVE_CERTIFICATES (from constants/permissions.js)
 * Matches Database-Design.md §10.3: ('Approve Certificates', 'certificates', 'update')
 */

import { Router } from 'express';

import { ICertificateRepository } from '../../repositories/interfaces/ICertificateRepository.js';
import { INotificationRepository } from '../../repositories/interfaces/INotificationRepository.js';
import { CertificateService } from '../../services/certificate.service.js';
import { NotificationService } from '../../services/notification.service.js';
import { CertificateController } from '../../controllers/certificate.controller.js';
import authorizePermission from '../../middlewares/authorizePermission.js';
import { validate } from '../../middlewares/validate.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { PERMISSIONS } from '../../constants/permissions.js';

import {
  certificateIdParamSchema,
  hardCopyRequestIdParamSchema,
  updateHardCopyStatusSchema,
  adminListCertificatesQuerySchema,
} from '../../validators/certificate.validator.js';

// ── Dependency injection ──────────────────────────────────────────────────────
const certRepo = new ICertificateRepository();
const notificationRepo = new INotificationRepository();

const notificationService = new NotificationService(notificationRepo);
const certificateService = new CertificateService(certRepo, notificationService);
const certificateController = new CertificateController(certificateService);

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

// GET /api/admin/certificates — any authenticated admin
router.get(
  '/',
  validate(adminListCertificatesQuerySchema, 'query'),
  asyncHandler(certificateController.adminList)
);

// PATCH /api/admin/certificates/hard-copy/:requestId — must be before /:id/*
router.patch(
  '/hard-copy/:requestId',
  authorizePermission(PERMISSIONS.APPROVE_CERTIFICATES),
  validate(hardCopyRequestIdParamSchema, 'params'),
  validate(updateHardCopyStatusSchema),
  asyncHandler(certificateController.adminUpdateHardCopy)
);

// PATCH /api/admin/certificates/:id/approve
router.patch(
  '/:id/approve',
  authorizePermission(PERMISSIONS.APPROVE_CERTIFICATES),
  validate(certificateIdParamSchema, 'params'),
  asyncHandler(certificateController.adminApprove)
);

export default router;
