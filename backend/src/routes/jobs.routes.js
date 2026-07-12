/**
 * Job Routes — Public + Student
 *
 * Routes (from Backend-Architecture.md §18.10):
 *   GET  /api/jobs              — public, no auth
 *   GET  /api/jobs/:id          — public, no auth
 *   POST /api/jobs/:id/apply    — Student JWT
 *
 * Route ordering: /:id/apply must be registered after /:id (Express matches
 * the more specific full path /id/apply before the param-only /:id route
 * when they are in the same router — registering order matters for params).
 */

import { Router } from 'express';

import { IJobRepository } from '../repositories/interfaces/IJobRepository.js';
import { IUserRepository } from '../repositories/interfaces/IUserRepository.js';
import { JobService } from '../services/job.service.js';
import { JobController } from '../controllers/job.controller.js';
import authenticate from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import asyncHandler from '../utils/asyncHandler.js';

import {
  listJobsQuerySchema,
  jobIdParamSchema,
  applyJobSchema,
} from '../validators/job.validator.js';

// ── Dependency injection ──────────────────────────────────────────────────────
const jobRepo = new IJobRepository();
const jobService = new JobService(jobRepo);
const jobController = new JobController(jobService);

const userRepo = new IUserRepository();
const authMiddleware = authenticate(userRepo);

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

// GET /api/jobs — public
router.get(
  '/',
  validate(listJobsQuerySchema, 'query'),
  asyncHandler(jobController.listPublic)
);

// GET /api/jobs/:id — public
router.get(
  '/:id',
  validate(jobIdParamSchema, 'params'),
  asyncHandler(jobController.getById)
);

// POST /api/jobs/:id/apply — Student JWT
router.post(
  '/:id/apply',
  authMiddleware,
  validate(jobIdParamSchema, 'params'),
  validate(applyJobSchema),
  asyncHandler(jobController.apply)
);

export default router;
