/**
 * Certificate Service
 *
 * All business logic for certificate management.
 * Depends on ICertificateRepository and NotificationService.
 * Never touches req/res. Never imports Prisma.
 *
 * Methods implemented (from Backend-Architecture.md §5.5):
 *   generateCertificate(enrollmentId)
 *   approveCertificate(adminId, certId)
 *   verifyCertificate(certNumber)
 *   listAdmin(rawQuery)
 *   updateHardCopyStatus(adminId, requestId, status)
 *
 * Method NOT implemented — deferred to Phase 15 (Settings module):
 *   requestHardCopy(userId, certId, dto)
 *   Reason: §5.5 states "fetch hard_copy_fee from settings table".
 *   ISettingsRepository is not available until Phase 15 (CMS Module).
 *   The shipping_fee column is NOT NULL in the DB — no default can be used.
 *   Reference: Backend-Architecture.md §5.5, Database-Design.md §5.19.
 *
 * Certificate number algorithm (from §18.7):
 *   Format: IW-{YEAR}-{SEQUENCE}
 *   1. Query max existing cert_number for current year
 *   2. Increment sequence; zero-pad to 6 digits
 *   3. If UNIQUE constraint violation on insert → retry with +1
 *
 * Notification events (from §15.3 and §15.4):
 *   generateCertificate → "Your certificate is being prepared"
 *   approveCertificate  → "Download your certificate"
 */

import { AppError } from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';
import { parsePaginationQuery, buildPaginationMeta } from '../utils/pagination.js';
import { formatCertNumber, parseCertSequence, getCurrentYear } from '../utils/certNumber.js';
import logger from '../logger/logger.js';

/** Maximum retries for cert number collision */
const MAX_CERT_RETRIES = 5;

export class CertificateService {
  /**
   * @param {import('../repositories/interfaces/ICertificateRepository.js').ICertificateRepository} certRepo
   * @param {import('./notification.service.js').NotificationService} notificationService
   */
  constructor(certRepo, notificationService) {
    this.certRepo = certRepo;
    this.notificationService = notificationService;
  }

  // ── Generate certificate ───────────────────────────────────────────────────

  /**
   * Generate and store a certificate when a student completes all modules.
   * Called by EnrollmentService.markModuleComplete() when enrollment status
   * transitions to 'completed'.
   *
   * Algorithm from §18.7:
   *   1. Compute cert_number using findLatestCertNumberForYear + formatCertNumber
   *   2. Insert certificate record
   *   3. If P2002 (unique constraint) → retry up to MAX_CERT_RETRIES times
   *   4. Notify student
   *
   * @param {string} enrollmentId
   * @param {string} userId - student's user ID (passed from EnrollmentService)
   * @returns {Promise<object>} Created certificate record
   */
  async generateCertificate(enrollmentId, userId) {
    const year = getCurrentYear();
    let certificate = null;
    let attempt = 0;

    while (attempt < MAX_CERT_RETRIES) {
      // Step 1: find highest existing sequence for this year
      const latest = await this.certRepo.findLatestCertNumberForYear(year);
      const nextSequence = parseCertSequence(latest) + 1;
      const certNumber = formatCertNumber(year, nextSequence);

      try {
        // Step 2: insert — may throw P2002 if race condition
        certificate = await this.certRepo.create({
          user_id: userId,
          enrollment_id: enrollmentId,
          cert_number: certNumber,
        });
        break; // success
      } catch (err) {
        // Step 3: retry on unique constraint violation
        if (err.code === 'P2002') {
          attempt++;
          logger.warn('Cert number collision, retrying', { certNumber, attempt });
          if (attempt >= MAX_CERT_RETRIES) {
            throw new AppError(500, 'Failed to generate a unique certificate number. Please try again.');
          }
          continue;
        }
        throw err; // unexpected error
      }
    }

    // Step 4: notify student (§15.3: "Send notification to student")
    this.notificationService
      .send(
        userId,
        'Certificate Being Prepared',
        'Congratulations! You have completed all modules. Your certificate is being prepared.',
        'certificate'
      )
      .catch((err) => logger.error('Failed to send certificate generation notification', { error: err.message }));

    logger.info('Certificate generated', { enrollmentId, certNumber: certificate.cert_number });

    return certificate;
  }

  // ── Approve certificate ────────────────────────────────────────────────────

  /**
   * Admin approves a certificate: sets admin_approved=TRUE, issued_at=NOW().
   * Notifies student to download their certificate.
   *
   * From §5.5:
   *   "Set admin_approved=TRUE; trigger PDF generation (placeholder in v1)"
   *
   * From §15.4:
   *   "Certificate approved → Notify student: download your certificate"
   *
   * @param {string} adminId
   * @param {string} certId
   * @returns {Promise<object>} Updated certificate record
   */
  async approveCertificate(adminId, certId) {
    const certificate = await this.certRepo.findById(certId);

    if (!certificate) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    if (certificate.admin_approved) {
      throw new AppError(400, 'Certificate is already approved.');
    }

    const updated = await this.certRepo.approve(certId);

    // Notify student (§15.4: "Certificate approved → Notify student: download your certificate")
    this.notificationService
      .send(
        certificate.user_id,
        'Certificate Ready',
        `Your certificate is ready. Certificate number: ${certificate.cert_number}`,
        'certificate'
      )
      .catch((err) => logger.error('Failed to send certificate approval notification', { error: err.message }));

    logger.info('Certificate approved', { certId, adminId });

    return updated;
  }

  // ── Verify certificate (public) ────────────────────────────────────────────

  /**
   * Public endpoint — verify a certificate by its certificate number.
   * Returns student name, course name, and issued date.
   *
   * From §5.5:
   *   "Find certificate; return with student name, course, issued date"
   *
   * @param {string} certNumber - e.g. "IW-2026-000042"
   * @returns {Promise<object>} Certificate with student and course data
   */
  async verifyCertificate(certNumber) {
    const certificate = await this.certRepo.findByCertNumber(certNumber);

    if (!certificate) {
      throw new AppError(404, 'Certificate not found. The certificate number may be invalid.');
    }

    return certificate;
  }

  // ── Student: my certificates ───────────────────────────────────────────────

  /**
   * List all certificates belonging to the authenticated student.
   *
   * From §4.6: GET /api/certificates/mine — Student JWT
   *
   * @param {string} userId
   * @returns {Promise<object[]>}
   */
  async myCertificates(userId) {
    return this.certRepo.findByUserId(userId);
  }

  // ── Student: download certificate ─────────────────────────────────────────

  /**
   * Retrieve a certificate for download.
   * Verifies the certificate belongs to the requesting student and is approved.
   *
   * From §4.6:
   *   GET /api/certificates/:id/download — 200 (redirect to PDF URL) — Student JWT
   *
   * @param {string} userId
   * @param {string} certId
   * @returns {Promise<object>} Certificate record including pdf_url
   */
  async getCertificateForDownload(userId, certId) {
    const certificate = await this.certRepo.findById(certId);

    if (!certificate) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    if (certificate.user_id !== userId) {
      throw new AppError(403, MESSAGES.FORBIDDEN);
    }

    if (!certificate.admin_approved) {
      throw new AppError(403, 'Your certificate has not been approved yet.');
    }

    return certificate;
  }

  // ── Admin: list certificates ───────────────────────────────────────────────

  /**
   * Paginated list of all certificates for admin view.
   *
   * From §4.6: GET /api/admin/certificates — Query: pagination — Admin
   *
   * @param {object} rawQuery - req.query (admin_approved filter, page, limit)
   * @returns {Promise<{ certificates: object[], meta: object }>}
   */
  async listAdmin(rawQuery) {
    const { page, limit, skip, take } = parsePaginationQuery(rawQuery);

    // admin_approved may be boolean true/false or undefined (all)
    const filters = {};
    if (rawQuery.admin_approved !== undefined) {
      filters.admin_approved = rawQuery.admin_approved;
    }

    const [certificates, total] = await Promise.all([
      this.certRepo.listAdmin(filters, { skip, take }),
      this.certRepo.countAdmin(filters),
    ]);

    return { certificates, meta: buildPaginationMeta(total, page, limit) };
  }

  // ── Admin: update hard copy request status ────────────────────────────────

  /**
   * Update the dispatch status of a hard copy request.
   * Admin marks a request as dispatched or delivered.
   *
   * From §4.6:
   *   PATCH /api/admin/certificates/hard-copy/:requestId
   *   Body: { status } — 200 { request } — Admin
   *
   * @param {string} adminId
   * @param {string} requestId
   * @param {string} status - HardcopyStatus value
   * @returns {Promise<object>} Updated hard copy request record
   */
  async updateHardCopyStatus(adminId, requestId, status) {
    const request = await this.certRepo.findHardCopyRequestById(requestId);

    if (!request) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    const updated = await this.certRepo.updateHardCopyStatus(requestId, status);

    logger.info('Hard copy status updated', { requestId, status, adminId });

    return updated;
  }
}
