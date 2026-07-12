/**
 * Certificate Controller
 *
 * HTTP boundary for certificate operations.
 * No business logic. No direct data access.
 * Responsibilities: parse request → call CertificateService → return response.
 *
 * Implemented endpoints (from Backend-Architecture.md §4.6):
 *   GET   /api/certificates/mine
 *   GET   /api/certificates/verify/:cert_number   (public — no auth)
 *   GET   /api/certificates/:id/download
 *   GET   /api/admin/certificates
 *   PATCH /api/admin/certificates/:id/approve
 *   PATCH /api/admin/certificates/hard-copy/:requestId
 *
 * Deferred endpoint (depends on Phase 15 — Settings module):
 *   POST  /api/certificates/:id/hard-copy
 *   Reason: requires hard_copy_fee from settings table (§5.5).
 *   Will be implemented in Phase 15 when ISettingsRepository is available.
 */

import { sendSuccess } from '../utils/response.js';
import { MESSAGES } from '../constants/messages.js';

export class CertificateController {
  /**
   * @param {import('../services/certificate.service.js').CertificateService} certificateService
   */
  constructor(certificateService) {
    this.certificateService = certificateService;
  }

  /**
   * GET /api/certificates/mine
   * Returns all certificates belonging to the authenticated student.
   */
  myCertificates = async (req, res, next) => {
    try {
      const certificates = await this.certificateService.myCertificates(req.user.id);
      return sendSuccess(res, 200, MESSAGES.CERTIFICATES_FETCHED, certificates);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * GET /api/certificates/verify/:cert_number
   * Public endpoint — verifies a certificate by its certificate number.
   * Returns student name, course, and issued date.
   */
  verify = async (req, res, next) => {
    try {
      const certificate = await this.certificateService.verifyCertificate(req.params.cert_number);
      return sendSuccess(res, 200, MESSAGES.CERTIFICATE_VERIFIED, certificate);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * GET /api/certificates/:id/download
   * Returns the certificate record (including pdf_url) for an authenticated student.
   * The client handles the redirect/download from pdf_url.
   */
  download = async (req, res, next) => {
    try {
      const certificate = await this.certificateService.getCertificateForDownload(
        req.user.id,
        req.params.id
      );
      return sendSuccess(res, 200, MESSAGES.CERTIFICATE_VERIFIED, certificate);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * GET /api/admin/certificates
   * Paginated list of all certificates for admin.
   */
  adminList = async (req, res, next) => {
    try {
      const { certificates, meta } = await this.certificateService.listAdmin(req.query);
      return sendSuccess(res, 200, MESSAGES.CERTIFICATES_FETCHED, certificates, meta);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * PATCH /api/admin/certificates/:id/approve
   * Admin approves a certificate (sets admin_approved=TRUE).
   */
  adminApprove = async (req, res, next) => {
    try {
      const certificate = await this.certificateService.approveCertificate(
        req.admin.id,
        req.params.id
      );
      return sendSuccess(res, 200, MESSAGES.CERTIFICATE_APPROVED, certificate);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * PATCH /api/admin/certificates/hard-copy/:requestId
   * Admin updates the dispatch status of a hard copy request.
   */
  adminUpdateHardCopy = async (req, res, next) => {
    try {
      const request = await this.certificateService.updateHardCopyStatus(
        req.admin.id,
        req.params.requestId,
        req.body.status
      );
      return sendSuccess(res, 200, MESSAGES.HARD_COPY_UPDATED, request);
    } catch (err) {
      return next(err);
    }
  };
}
