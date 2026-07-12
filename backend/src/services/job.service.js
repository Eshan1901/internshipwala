/**
 * Job Service
 *
 * All business logic for job listing and application management.
 * Depends exclusively on IJobRepository — no Prisma, no Express objects.
 *
 * Business rules enforced here (from Backend-Architecture.md §3.10):
 *   - Expired listings (deadline < TODAY) are hidden from public (column: deadline DATE)
 *   - A student may apply to the same listing only once (app-layer check + DB UNIQUE)
 *   - Listings are soft-deleted — never hard-deleted
 */

import { AppError } from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';
import { parsePaginationQuery, buildPaginationMeta } from '../utils/pagination.js';
import logger from '../logger/logger.js';

export class JobService {
  /**
   * @param {import('../repositories/interfaces/IJobRepository.js').IJobRepository} jobRepo
   */
  constructor(jobRepo) {
    this.jobRepo = jobRepo;
  }

  // ── Public: list active listings ───────────────────────────────────────────

  /**
   * List active, non-expired, non-deleted job listings.
   * Expired = deadline < CURRENT_DATE (§3.10; column name from §5.20: deadline DATE).
   *
   * @param {object} rawQuery - req.query (type, page, limit)
   * @returns {Promise<{ jobs: object[], meta: object }>}
   */
  async listPublic(rawQuery) {
    const { page, limit, skip, take } = parsePaginationQuery(rawQuery);
    const filters = { listing_type: rawQuery.type };

    const [jobs, total] = await Promise.all([
      this.jobRepo.listActive(filters, { skip, take }),
      this.jobRepo.countActive(filters),
    ]);

    return { jobs, meta: buildPaginationMeta(total, page, limit) };
  }

  // ── Public: get listing detail ─────────────────────────────────────────────

  /**
   * Fetch a single active, non-expired listing by ID.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    const job = await this.jobRepo.findById(id);
    if (!job) throw new AppError(404, MESSAGES.NOT_FOUND);
    return job;
  }

  // ── Student: apply to listing ──────────────────────────────────────────────

  /**
   * Submit a student application to a job listing.
   *
   * Business rules (§3.10):
   *   - Listing must be active and not expired
   *   - A student may apply only once (application-layer uniqueness check)
   *
   * @param {string} userId
   * @param {string} jobId
   * @param {{ cover_note?: string, resume_url?: string }} dto
   * @returns {Promise<object>} Created application
   */
  async apply(userId, jobId, dto) {
    // Verify listing exists and is active/non-expired
    const job = await this.jobRepo.findById(jobId);
    if (!job) throw new AppError(404, MESSAGES.NOT_FOUND);

    // Application-layer uniqueness check (§3.10: "apply to the same listing only once")
    const existing = await this.jobRepo.findApplication(userId, jobId);
    if (existing) {
      throw new AppError(409, 'You have already applied to this listing.');
    }

    const application = await this.jobRepo.createApplication({
      user_id: userId,
      job_listing_id: jobId,
      cover_note: dto.cover_note,
      resume_url: dto.resume_url,
    });

    logger.info('Job application submitted', { userId, jobId });

    return application;
  }

  // ── Admin: list all listings ───────────────────────────────────────────────

  /**
   * @param {object} rawQuery
   * @returns {Promise<{ jobs: object[], meta: object }>}
   */
  async adminList(rawQuery) {
    const { page, limit, skip, take } = parsePaginationQuery(rawQuery);
    const filters = {
      listing_type: rawQuery.type,
      is_active: rawQuery.is_active,
    };

    const [jobs, total] = await Promise.all([
      this.jobRepo.listAdmin(filters, { skip, take }),
      this.jobRepo.countAdmin(filters),
    ]);

    return { jobs, meta: buildPaginationMeta(total, page, limit) };
  }

  // ── Admin: create listing ──────────────────────────────────────────────────

  /**
   * @param {string} adminId
   * @param {object} dto
   * @returns {Promise<object>} Created listing
   */
  async adminCreate(adminId, dto) {
    const job = await this.jobRepo.createListing({
      created_by: adminId,
      ...dto,
    });

    logger.info('Job listing created', { jobId: job.id, adminId });

    return job;
  }

  // ── Admin: update listing ──────────────────────────────────────────────────

  /**
   * @param {string} adminId
   * @param {string} id
   * @param {object} dto
   * @returns {Promise<object>} Updated listing
   */
  async adminUpdate(adminId, id, dto) {
    const existing = await this.jobRepo.findByIdAdmin(id);
    if (!existing) throw new AppError(404, MESSAGES.NOT_FOUND);

    const updated = await this.jobRepo.updateListing(id, dto);

    logger.info('Job listing updated', { jobId: id, adminId });

    return updated;
  }

  // ── Admin: delete listing ──────────────────────────────────────────────────

  /**
   * Soft-delete a listing. Never hard-deletes (§3.10).
   * @param {string} adminId
   * @param {string} id
   * @returns {Promise<void>}
   */
  async adminDelete(adminId, id) {
    const existing = await this.jobRepo.findByIdAdmin(id);
    if (!existing) throw new AppError(404, MESSAGES.NOT_FOUND);

    await this.jobRepo.softDeleteListing(id);

    logger.info('Job listing deleted', { jobId: id, adminId });
  }

  // ── Admin: list applicants ─────────────────────────────────────────────────

  /**
   * Paginated list of applicants for a job listing.
   * @param {string} adminId
   * @param {string} jobId
   * @param {object} rawQuery
   * @returns {Promise<{ applicants: object[], meta: object }>}
   */
  async adminListApplicants(adminId, jobId, rawQuery) { // eslint-disable-line no-unused-vars
    const existing = await this.jobRepo.findByIdAdmin(jobId);
    if (!existing) throw new AppError(404, MESSAGES.NOT_FOUND);

    const { page, limit, skip, take } = parsePaginationQuery(rawQuery);

    const [applicants, total] = await Promise.all([
      this.jobRepo.listApplicants(jobId, { skip, take }),
      this.jobRepo.countApplicants(jobId),
    ]);

    return { applicants, meta: buildPaginationMeta(total, page, limit) };
  }
}
