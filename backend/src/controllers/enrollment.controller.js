/**
 * Enrollment Controller
 *
 * HTTP boundary for student enrollment and module progression.
 * No business logic. No direct data access.
 * Responsibilities: parse request → call EnrollmentService → return response.
 *
 * Endpoints (from Backend-Architecture.md §4.4):
 *   POST  /api/enrollments
 *   GET   /api/enrollments/mine
 *   GET   /api/enrollments/:id/modules
 *   POST  /api/enrollments/:id/modules/:moduleId/complete
 *   POST  /api/enrollments/:id/assignments/:assignmentId/submit
 *   GET   /api/admin/enrollments
 *   PATCH /api/admin/enrollments/:id/activate
 *   PATCH /api/admin/enrollments/:id/cancel
 */

import { sendSuccess } from '../utils/response.js';
import { MESSAGES } from '../constants/messages.js';

export class EnrollmentController {
  /**
   * @param {import('../services/enrollment.service.js').EnrollmentService} enrollmentService
   */
  constructor(enrollmentService) {
    this.enrollmentService = enrollmentService;
  }

  /**
   * POST /api/enrollments
   * Enroll the authenticated student in a course.
   */
  enroll = async (req, res, next) => {
    try {
      const result = await this.enrollmentService.enroll(req.user.id, req.body);
      return sendSuccess(res, 201, MESSAGES.ENROLLED_SUCCESS, result);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * GET /api/enrollments/mine
   * List the authenticated student's enrollments.
   */
  myEnrollments = async (req, res, next) => {
    try {
      const enrollments = await this.enrollmentService.myEnrollments(req.user.id, req.query);
      return sendSuccess(res, 200, MESSAGES.ENROLLMENTS_FETCHED, enrollments);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * GET /api/enrollments/:id/modules
   * Fetch course modules with progress and is_accessible flags.
   */
  getModules = async (req, res, next) => {
    try {
      const result = await this.enrollmentService.getModulesWithProgress(
        req.user.id,
        req.params.id
      );
      return sendSuccess(res, 200, MESSAGES.MODULES_FETCHED, result);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * POST /api/enrollments/:id/modules/:moduleId/complete
   * Mark a module as complete. Triggers enrollment completion if all done.
   */
  markModuleComplete = async (req, res, next) => {
    try {
      const result = await this.enrollmentService.markModuleComplete(
        req.user.id,
        req.params.id,
        req.params.moduleId
      );
      return sendSuccess(res, 200, MESSAGES.MODULE_COMPLETED, result);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * POST /api/enrollments/:id/assignments/:assignmentId/submit
   * Submit an assignment or quiz response.
   */
  submitAssignment = async (req, res, next) => {
    try {
      const submission = await this.enrollmentService.submitAssignment(
        req.user.id,
        req.params.id,
        req.params.assignmentId,
        req.body
      );
      return sendSuccess(res, 201, MESSAGES.ASSIGNMENT_SUBMITTED, submission);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * GET /api/admin/enrollments
   * List all enrollments for admin view (paginated, filterable).
   */
  adminList = async (req, res, next) => {
    try {
      const { enrollments, meta } = await this.enrollmentService.adminList(req.query);
      return sendSuccess(res, 200, MESSAGES.ENROLLMENTS_FETCHED, enrollments, meta);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * PATCH /api/admin/enrollments/:id/activate
   * Activate a pending enrollment after payment confirmation.
   */
  adminActivate = async (req, res, next) => {
    try {
      const enrollment = await this.enrollmentService.activateEnrollment(req.params.id);
      return sendSuccess(res, 200, MESSAGES.ENROLLMENT_ACTIVATED, enrollment);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * PATCH /api/admin/enrollments/:id/cancel
   * Cancel an enrollment.
   */
  adminCancel = async (req, res, next) => {
    try {
      const enrollment = await this.enrollmentService.cancelEnrollment(req.params.id);
      return sendSuccess(res, 200, MESSAGES.ENROLLMENT_CANCELLED, enrollment);
    } catch (err) {
      return next(err);
    }
  };
}
