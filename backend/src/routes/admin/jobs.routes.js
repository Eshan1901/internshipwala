/**
 * Admin Job Routes
 *
 * Mounted under /api/admin/jobs by admin/index.js.
 * authenticateAdmin is already applied by the parent admin router.
 *
 * Routes (from Backend-Architecture.md §18.10):
 *   GET    /api/admin/jobs
 *   POST   /api/admin/jobs
 *   GET    /api/admin/jobs/:id/applicants  — must be before /:id routes
 *   PUT    /api/admin/jobs/:id
 *   DELETE /api/admin/jobs/:id
 *
 * Permission: MANAGE_JOB_LISTINGS for write operations.
 * Any authenticated admin can view listings and applicants.
 * Matches Database-Design.md §10.3: ('Manage Job Listings', 'jobs', 'create')
 */

import { Router } from 'express';

import { IJobRepository } from '../../repositories/interfaces/IJobRepository.js';
import { JobService } from '../../services/job.service.js';
import { JobController } from '../../controllers/job.controller.js';
import authorizePermission from '../../middlewares/authorizePermission.js';
import { validate } from '../../middlewares/validate.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { PERMISSIONS } from '../../constants/permissions.js';

import {
  adminListJobsQuerySchema,
  createJobSchema,
  updateJobSchema,
  jobIdParamSchema,
  applicantsQuerySchema,
} from '../../validators/job.validator.js';

// ── Dependency injection ──────────────────────────────────────────────────────
const jobRepo = new IJobRepository();
const jobService = new JobService(jobRepo);
const jobController = new JobController(jobService);

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

// GET /api/admin/jobs — any authenticated admin
router.get(
  '/',
  validate(adminListJobsQuerySchema, 'query'),
  asyncHandler(jobController.adminList)
);

// POST /api/admin/jobs
router.post(
  '/',
  authorizePermission(PERMISSIONS.MANAGE_JOB_LISTINGS),
  validate(createJobSchema),
  asyncHandler(jobController.adminCreate)
);

// GET /api/admin/jobs/:id/applicants — must be before /:id
router.get(
  '/:id/applicants',
  validate(jobIdParamSchema, 'params'),
  validate(applicantsQuerySchema, 'query'),
  asyncHandler(jobController.adminListApplicants)
);

// PUT /api/admin/jobs/:id
router.put(
  '/:id',
  authorizePermission(PERMISSIONS.MANAGE_JOB_LISTINGS),
  validate(jobIdParamSchema, 'params'),
  validate(updateJobSchema),
  asyncHandler(jobController.adminUpdate)
);

// DELETE /api/admin/jobs/:id
router.delete(
  '/:id',
  authorizePermission(PERMISSIONS.MANAGE_JOB_LISTINGS),
  validate(jobIdParamSchema, 'params'),
  asyncHandler(jobController.adminDelete)
);

export default router;
