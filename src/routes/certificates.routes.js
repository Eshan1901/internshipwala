/**
 * Certificate Routes — Student-facing + Public
 *
 * Dependency injection:
 *   ICertificateRepository → CertificateService → CertificateController
 *
 * Route ordering is critical — specific paths before parameterised paths:
 *   /mine           — must come before /:id/*
 *   /verify/:cert_number — must come before /:id/*
 *
 * Implemented routes (from Backend-Architecture.md §4.6):
 *   GET /api/certificates/mine                    — Student JWT
 *   GET /api/certificates/verify/:cert_number     — No auth (public)
 *   GET /api/certificates/:id/download            — Student JWT
 *
 * Deferred route (Phase 15 — requires Settings module):
 *   POST /api/certificates/:id/hard-copy
 *   Dependency: hard_copy_fee must be fetched from settings table (§5.5).
 *   ISettingsRepository is not yet available.
 */

import { Router } from 'express';

import { ICertificateRepository } from '../repositories/interfaces/ICertificateRepository.js';
import { INotificationRepository } from '../repositories/interfaces/INotificationRepository.js';
import { IUserRepository } from '../repositories/interfaces/IUserRepository.js';
import { CertificateService } from '../services/certificate.service.js';
import { NotificationService } from '../services/notification.service.js';
import { CertificateController } from '../controllers/certificate.controller.js';
import authenticate from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import asyncHandler from '../utils/asyncHandler.js';

import {
  certificateIdParamSchema,
  certNumberParamSchema,
} from '../validators/certificate.validator.js';

// ── Dependency injection ──────────────────────────────────────────────────────
const certRepo = new ICertificateRepository();
const notificationRepo = new INotificationRepository();

const notificationService = new NotificationService(notificationRepo);
const certificateService = new CertificateService(certRepo, notificationService);
const certificateController = new CertificateController(certificateService);

const userRepo = new IUserRepository();
const authMiddleware = authenticate(userRepo);

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

// GET /api/certificates/mine — must be before /:id routes
router.get(
  '/mine',
  authMiddleware,
  asyncHandler(certificateController.myCertificates)
);

// GET /api/certificates/verify/:cert_number — public, no auth
router.get(
  '/verify/:cert_number',
  validate(certNumberParamSchema, 'params'),
  asyncHandler(certificateController.verify)
);

// GET /api/certificates/:id/download — Student JWT
router.get(
  '/:id/download',
  authMiddleware,
  validate(certificateIdParamSchema, 'params'),
  asyncHandler(certificateController.download)
);

export default router;
