/**
 * Job Controller
 *
 * HTTP boundary for job listing and application operations.
 * No business logic. No direct data access.
 *
 * Endpoints (from Backend-Architecture.md §18.10):
 *   GET  /api/jobs
 *   GET  /api/jobs/:id
 *   POST /api/jobs/:id/apply       (Student JWT)
 *   GET  /api/admin/jobs
 *   POST /api/admin/jobs
 *   PUT  /api/admin/jobs/:id
 *   DELETE /api/admin/jobs/:id
 *   GET  /api/admin/jobs/:id/applicants
 */

import { sendSuccess } from '../utils/response.js';
import { MESSAGES } from '../constants/messages.js';

export class JobController {
  /**
   * @param {import('../services/job.service.js').JobService} jobService
   */
  constructor(jobService) {
    this.jobService = jobService;
  }

  /** GET /api/jobs */
  listPublic = async (req, res, next) => {
    try {
      const { jobs, meta } = await this.jobService.listPublic(req.query);
      return sendSuccess(res, 200, MESSAGES.JOBS_FETCHED, jobs, meta);
    } catch (err) {
      return next(err);
    }
  };

  /** GET /api/jobs/:id */
  getById = async (req, res, next) => {
    try {
      const job = await this.jobService.getById(req.params.id);
      return sendSuccess(res, 200, MESSAGES.JOB_FETCHED, job);
    } catch (err) {
      return next(err);
    }
  };

  /** POST /api/jobs/:id/apply */
  apply = async (req, res, next) => {
    try {
      const application = await this.jobService.apply(req.user.id, req.params.id, req.body);
      return sendSuccess(res, 201, MESSAGES.JOB_APPLIED, application);
    } catch (err) {
      return next(err);
    }
  };

  /** GET /api/admin/jobs */
  adminList = async (req, res, next) => {
    try {
      const { jobs, meta } = await this.jobService.adminList(req.query);
      return sendSuccess(res, 200, MESSAGES.JOBS_FETCHED, jobs, meta);
    } catch (err) {
      return next(err);
    }
  };

  /** POST /api/admin/jobs */
  adminCreate = async (req, res, next) => {
    try {
      const job = await this.jobService.adminCreate(req.admin.id, req.body);
      return sendSuccess(res, 201, MESSAGES.JOB_CREATED, job);
    } catch (err) {
      return next(err);
    }
  };

  /** PUT /api/admin/jobs/:id */
  adminUpdate = async (req, res, next) => {
    try {
      const job = await this.jobService.adminUpdate(req.admin.id, req.params.id, req.body);
      return sendSuccess(res, 200, MESSAGES.JOB_UPDATED, job);
    } catch (err) {
      return next(err);
    }
  };

  /** DELETE /api/admin/jobs/:id */
  adminDelete = async (req, res, next) => {
    try {
      await this.jobService.adminDelete(req.admin.id, req.params.id);
      return sendSuccess(res, 200, MESSAGES.JOB_DELETED);
    } catch (err) {
      return next(err);
    }
  };

  /** GET /api/admin/jobs/:id/applicants */
  adminListApplicants = async (req, res, next) => {
    try {
      const { applicants, meta } = await this.jobService.adminListApplicants(
        req.admin.id,
        req.params.id,
        req.query
      );
      return sendSuccess(res, 200, MESSAGES.APPLICANTS_FETCHED, applicants, meta);
    } catch (err) {
      return next(err);
    }
  };
}
