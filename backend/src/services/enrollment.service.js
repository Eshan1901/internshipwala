/**
 * Enrollment Service
 *
 * All business logic for student enrollment and module progression.
 * Depends on IEnrollmentRepository, IModuleProgressRepository,
 * ICourseRepository, and NotificationService.
 * Never touches req/res. Never imports Prisma.
 *
 * Methods (from Backend-Architecture.md §5.3):
 *   enroll(userId, dto)
 *   activateEnrollment(adminId, enrollmentId)
 *   cancelEnrollment(adminId, enrollmentId)
 *   getModulesWithProgress(userId, enrollmentId)
 *   markModuleComplete(userId, enrollmentId, moduleId)
 *   submitAssignment(userId, enrollmentId, assignmentId, dto)
 *
 * Business rules (from §3.5 and §5.3):
 *   - Enrollment + payment creation must be atomic (one transaction)
 *   - A student cannot have two simultaneous active enrollments in the same course
 *   - Re-enrollment after cancellation is permitted (partial unique index)
 *   - Module 2 is not accessible until Module 1 is marked complete (sequential gating)
 *   - When all modules complete → mark enrollment completed → trigger certificate generation
 */

import { AppError } from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';
import { parsePaginationQuery, buildPaginationMeta } from '../utils/pagination.js';
import { EnrollmentStatus } from '../constants/enums.js';
import logger from '../logger/logger.js';

export class EnrollmentService {
  /**
   * @param {import('../repositories/interfaces/IEnrollmentRepository.js').IEnrollmentRepository} enrollmentRepo
   * @param {import('../repositories/interfaces/IModuleProgressRepository.js').IModuleProgressRepository} progressRepo
   * @param {import('../repositories/interfaces/ICourseRepository.js').ICourseRepository} courseRepo
   * @param {import('./notification.service.js').NotificationService} notificationService
   * @param {import('./certificate.service.js').CertificateService} certificateService
   */
  constructor(enrollmentRepo, progressRepo, courseRepo, notificationService, certificateService) {
    this.enrollmentRepo = enrollmentRepo;
    this.progressRepo = progressRepo;
    this.courseRepo = courseRepo;
    this.notificationService = notificationService;
    this.certificateService = certificateService;
  }

  // ── Enroll ─────────────────────────────────────────────────────────────────

  /**
   * Create an enrollment and initial payment record atomically.
   *
   * From §5.3:
   *   "Validate course published; check uq_active_enrollment;
   *    create enrollment + payment in $transaction; notify student"
   *
   * @param {string} userId
   * @param {{ course_id: string, duration_fee_id: string }} dto
   * @returns {Promise<{ enrollment: object, payment: object }>}
   */
  async enroll(userId, dto) {
    // Verify the course exists and is published
    const course = await this.courseRepo.findPublicById(dto.course_id);
    if (!course) {
      throw new AppError(404, 'Course not found or is not available for enrollment.');
    }

    // Check for an existing active enrollment (enforced by uq_active_enrollment index)
    const existing = await this.enrollmentRepo.findByUserAndCourse(userId, dto.course_id);
    if (existing) {
      throw new AppError(409, 'You are already enrolled in this course.');
    }

    // Find the selected duration/fee option to snapshot the fee
    const durationFee = Array.isArray(course.course_duration_fees)
      ? course.course_duration_fees.find(
          (df) => df.id === dto.duration_fee_id && df.is_active
        )
      : null;

    if (!durationFee) {
      throw new AppError(404, 'The selected duration/fee option is not available.');
    }

    // Create enrollment (status=pending) + payment (status=pending) atomically
    const result = await this.enrollmentRepo.createWithPayment(
      {
        user_id: userId,
        course_id: dto.course_id,
        duration_fee_id: dto.duration_fee_id,
        fee_paid: durationFee.fee,
      },
      {
        user_id: userId,
        amount: durationFee.fee,
      }
    );

    // Notify student — fire and forget
    this.notificationService
      .send(
        userId,
        'Enrollment Pending',
        `You have enrolled in "${course.title}". Please complete your payment to activate access.`,
        'enrollment'
      )
      .catch((err) => logger.error('Failed to send enrollment notification', { error: err.message }));

    logger.info('Student enrolled', { userId, courseId: dto.course_id, enrollmentId: result.enrollment.id });

    return result;
  }

  // ── My enrollments ─────────────────────────────────────────────────────────

  /**
   * List enrollments for the authenticated student.
   *
   * @param {string} userId
   * @param {object} rawQuery - req.query (status, page, limit)
   * @returns {Promise<object[]>}
   */
  async myEnrollments(userId, rawQuery) {
    const statusFilter = rawQuery.status || null;
    const enrollments = await this.enrollmentRepo.findUserEnrollments(userId, statusFilter);
    return enrollments;
  }

  // ── Get modules with progress ──────────────────────────────────────────────

  /**
   * Fetch the course modules for an enrollment and annotate each with
   * an is_accessible flag based on sequential completion.
   *
   * Module gating rule (from §5.3):
   *   Module 1 is always accessible.
   *   Module N (N > 1) is accessible only if module N-1 is_completed = TRUE.
   *
   * @param {string} userId
   * @param {string} enrollmentId
   * @returns {Promise<{ modules: object[], progress: object[] }>}
   */
  async getModulesWithProgress(userId, enrollmentId) {
    const enrollment = await this.enrollmentRepo.findById(enrollmentId);

    if (!enrollment) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    // Verify the enrollment belongs to this student
    if (enrollment.user_id !== userId) {
      throw new AppError(403, MESSAGES.FORBIDDEN);
    }

    // Progress records keyed by module_id for O(1) lookup
    const progressRecords = await this.progressRepo.getProgress(userId, enrollmentId);
    const progressMap = {};
    for (const record of progressRecords) {
      progressMap[record.module_id] = record;
    }

    // Modules ordered by module_no (guaranteed by the course repository)
    const modules = Array.isArray(enrollment.course?.course_modules)
      ? [...enrollment.course.course_modules].sort((a, b) => a.module_no - b.module_no)
      : [];

    // Annotate each module with is_accessible and its progress record
    const annotatedModules = modules.map((mod, index) => {
      const progress = progressMap[mod.id] || null;
      let is_accessible;

      if (index === 0) {
        // Module 1 is always accessible
        is_accessible = true;
      } else {
        // Module N requires module N-1 to be completed
        const prevModule = modules[index - 1];
        const prevProgress = progressMap[prevModule.id];
        is_accessible = !!(prevProgress && prevProgress.is_completed);
      }

      return { ...mod, is_accessible, progress };
    });

    return { modules: annotatedModules, progress: progressRecords };
  }

  // ── Mark module complete ───────────────────────────────────────────────────

  /**
   * Mark a module as complete for a student.
   *
   * Sequential gating enforced: if module_no > 1, the previous module
   * must already be completed.
   *
   * If all modules are now complete, the enrollment is marked 'completed'.
   * Certificate generation is triggered by a separate CertificateService
   * call injected in later phases — for now the enrollment status update
   * is the trigger point.
   *
   * From §5.3:
   *   "Verify sequential access; upsert module_progress;
   *    check if all modules done → mark enrollment completed"
   *
   * @param {string} userId
   * @param {string} enrollmentId
   * @param {string} moduleId
   * @returns {Promise<{ progress: object, enrollmentStatus: string }>}
   */
  async markModuleComplete(userId, enrollmentId, moduleId) {
    const enrollment = await this.enrollmentRepo.findById(enrollmentId);

    if (!enrollment) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    if (enrollment.user_id !== userId) {
      throw new AppError(403, MESSAGES.FORBIDDEN);
    }

    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new AppError(400, 'You can only complete modules in an active enrollment.');
    }

    // Find the target module and its position
    const modules = Array.isArray(enrollment.course?.course_modules)
      ? [...enrollment.course.course_modules].sort((a, b) => a.module_no - b.module_no)
      : [];

    const moduleIndex = modules.findIndex((m) => m.id === moduleId);

    if (moduleIndex === -1) {
      throw new AppError(404, 'Module not found in this course.');
    }

    // Sequential gating: if not the first module, verify the previous one is complete
    if (moduleIndex > 0) {
      const prevModule = modules[moduleIndex - 1];
      const prevCompleted = await this.progressRepo.isModuleCompleted(userId, prevModule.id);
      if (!prevCompleted) {
        throw new AppError(403, 'Complete the previous module first.');
      }
    }

    // Upsert the completion record
    const progress = await this.progressRepo.upsertCompletion(userId, moduleId, enrollmentId);

    // Check if all modules are now complete
    const completedCount = await this.progressRepo.countCompleted(enrollmentId);
    const totalModules = modules.length;

    let enrollmentStatus = enrollment.status;

    if (completedCount >= totalModules && totalModules > 0) {
      await this.enrollmentRepo.updateStatus(enrollmentId, EnrollmentStatus.COMPLETED);
      enrollmentStatus = EnrollmentStatus.COMPLETED;

      // Trigger certificate generation (Phase 12 integration point — §18.5 point 3)
      // CertificateService.generateCertificate() handles its own notification.
      this.certificateService
        .generateCertificate(enrollmentId, userId)
        .catch((err) => logger.error('Failed to generate certificate', { enrollmentId, error: err.message }));

      logger.info('Enrollment completed', { userId, enrollmentId });
    }

    return { progress, enrollmentStatus };
  }

  // ── Submit assignment ──────────────────────────────────────────────────────

  /**
   * Upsert a student's assignment submission.
   *
   * From §5.3:
   *   "Validate enrollment active; upsert submission"
   *
   * @param {string} userId
   * @param {string} enrollmentId
   * @param {string} assignmentId
   * @param {{ answer_text?: string, file_url?: string }} dto
   * @returns {Promise<object>} Submission record
   */
  async submitAssignment(userId, enrollmentId, assignmentId, dto) {
    const enrollment = await this.enrollmentRepo.findById(enrollmentId);

    if (!enrollment) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    if (enrollment.user_id !== userId) {
      throw new AppError(403, MESSAGES.FORBIDDEN);
    }

    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new AppError(400, 'Assignments can only be submitted for active enrollments.');
    }

    const submission = await this.progressRepo.upsertSubmission({
      user_id: userId,
      assignment_id: assignmentId,
      enrollment_id: enrollmentId,
      answer_text: dto.answer_text,
      file_url: dto.file_url,
    });

    logger.info('Assignment submitted', { userId, enrollmentId, assignmentId });

    return submission;
  }

  // ── Admin: activate enrollment ─────────────────────────────────────────────

  /**
   * Set enrollment status to 'active' (after payment confirmation).
   *
   * From §5.3:
   *   "Set enrollment status='active'; notify student"
   *
   * @param {string} enrollmentId
   * @returns {Promise<object>} Updated enrollment
   */
  async activateEnrollment(enrollmentId) {
    const enrollment = await this.enrollmentRepo.findById(enrollmentId);

    if (!enrollment) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    if (enrollment.status !== EnrollmentStatus.PENDING) {
      throw new AppError(400, `Enrollment cannot be activated from status '${enrollment.status}'.`);
    }

    const updated = await this.enrollmentRepo.updateStatus(enrollmentId, EnrollmentStatus.ACTIVE);

    this.notificationService
      .send(
        enrollment.user_id,
        'Course Access Activated',
        `Your payment has been confirmed. You can now access your course.`,
        'payment'
      )
      .catch((err) => logger.error('Failed to send activation notification', { error: err.message }));

    logger.info('Enrollment activated', { enrollmentId });

    return updated;
  }

  // ── Admin: cancel enrollment ───────────────────────────────────────────────

  /**
   * Set enrollment status to 'cancelled'.
   *
   * From §5.3:
   *   "Set enrollment status='cancelled'; log activity"
   *
   * @param {string} enrollmentId
   * @returns {Promise<object>} Updated enrollment
   */
  async cancelEnrollment(enrollmentId) {
    const enrollment = await this.enrollmentRepo.findById(enrollmentId);

    if (!enrollment) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    if (enrollment.status === EnrollmentStatus.CANCELLED) {
      throw new AppError(400, 'Enrollment is already cancelled.');
    }

    if (enrollment.status === EnrollmentStatus.COMPLETED) {
      throw new AppError(400, 'A completed enrollment cannot be cancelled.');
    }

    const updated = await this.enrollmentRepo.updateStatus(enrollmentId, EnrollmentStatus.CANCELLED);

    logger.info('Enrollment cancelled', { enrollmentId });

    return updated;
  }

  // ── Admin: list enrollments ────────────────────────────────────────────────

  /**
   * List all enrollments for admin view with optional filters and pagination.
   *
   * @param {object} rawQuery - req.query
   * @returns {Promise<{ enrollments: object[], meta: object }>}
   */
  async adminList(rawQuery) {
    const { page, limit, skip, take } = parsePaginationQuery(rawQuery);

    const filters = {
      status: rawQuery.status,
      user_id: rawQuery.user_id,
      course_id: rawQuery.course_id,
    };

    const [enrollments, total] = await Promise.all([
      this.enrollmentRepo.listAdmin(filters, { skip, take }),
      this.enrollmentRepo.countAdmin(filters),
    ]);

    return { enrollments, meta: buildPaginationMeta(total, page, limit) };
  }
}
