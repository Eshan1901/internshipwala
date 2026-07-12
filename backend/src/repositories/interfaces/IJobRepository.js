/**
 * IJobRepository — Job Repository Interface (Contract)
 *
 * Defines every data-access method the application layer requires for
 * the `job_listings` and `job_applications` tables.
 * The database developer implements this contract using Prisma.
 *
 * Tables:
 *   job_listings    (Database-Design.md §5.20) — soft-deleted
 *   job_applications (Database-Design.md §5.21) — UNIQUE (user_id, job_listing_id)
 *
 * Soft-delete rule: job_listings uses deleted_at. All public queries filter
 * deleted_at IS NULL. Admin queries see all records.
 *
 * Expiry rule (§3.10): "Expired listings are hidden from public listings"
 * The column is `deadline DATE` (§5.20). Public queries filter:
 *   WHERE is_active = TRUE AND deleted_at IS NULL
 *   AND (deadline IS NULL OR deadline >= CURRENT_DATE)
 */

export class IJobRepository {
  /**
   * List active, non-expired, non-deleted job listings for public view.
   * Filters: listing_type optional.
   * @param {{ listing_type?: string }} filters
   * @param {{ skip: number, take: number }} pagination
   * @returns {Promise<object[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async listActive(filters, pagination) { throw new Error('IJobRepository.listActive not implemented'); }

  /**
   * Count active, non-expired, non-deleted listings.
   * @param {{ listing_type?: string }} filters
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line no-unused-vars
  async countActive(filters) { throw new Error('IJobRepository.countActive not implemented'); }

  /**
   * Find a single active, non-expired, non-deleted listing by ID.
   * Used for the public detail endpoint.
   * @param {string} id - UUID
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findById(id) { throw new Error('IJobRepository.findById not implemented'); }

  /**
   * Find a listing by ID with no status/deleted_at filter.
   * Used by admin endpoints.
   * @param {string} id - UUID
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findByIdAdmin(id) { throw new Error('IJobRepository.findByIdAdmin not implemented'); }

  /**
   * Insert a new job listing.
   * @param {{ created_by: string, title: string, listing_type: string,
   *           company?: string, location?: string, description?: string,
   *           eligibility?: string, apply_url?: string, deadline?: Date }} data
   * @returns {Promise<object>} Created listing
   */
  // eslint-disable-next-line no-unused-vars
  async createListing(data) { throw new Error('IJobRepository.createListing not implemented'); }

  /**
   * Update mutable fields on a job listing.
   * @param {string} id - UUID
   * @param {Partial<object>} data
   * @returns {Promise<object>} Updated listing
   */
  // eslint-disable-next-line no-unused-vars
  async updateListing(id, data) { throw new Error('IJobRepository.updateListing not implemented'); }

  /**
   * Soft-delete a job listing by setting deleted_at = NOW().
   * Listings are never hard-deleted (§3.10).
   * @param {string} id - UUID
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async softDeleteListing(id) { throw new Error('IJobRepository.softDeleteListing not implemented'); }

  /**
   * Check if a student has already applied to a specific listing.
   * Used for the application-layer uniqueness check before insert.
   * @param {string} userId
   * @param {string} jobListingId
   * @returns {Promise<object|null>} Existing application or null
   */
  // eslint-disable-next-line no-unused-vars
  async findApplication(userId, jobListingId) { throw new Error('IJobRepository.findApplication not implemented'); }

  /**
   * Insert a new job application.
   * DB enforces UNIQUE (user_id, job_listing_id).
   * @param {{ user_id: string, job_listing_id: string, cover_note?: string, resume_url?: string }} data
   * @returns {Promise<object>} Created application
   */
  // eslint-disable-next-line no-unused-vars
  async createApplication(data) { throw new Error('IJobRepository.createApplication not implemented'); }

  /**
   * List all applicants for a specific job listing (admin view).
   * @param {string} jobListingId
   * @param {{ skip: number, take: number }} pagination
   * @returns {Promise<object[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async listApplicants(jobListingId, pagination) { throw new Error('IJobRepository.listApplicants not implemented'); }

  /**
   * Count applicants for a specific job listing.
   * @param {string} jobListingId
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line no-unused-vars
  async countApplicants(jobListingId) { throw new Error('IJobRepository.countApplicants not implemented'); }

  /**
   * List all job listings for admin view (no status/deleted_at filter).
   * @param {{ listing_type?: string, is_active?: boolean }} filters
   * @param {{ skip: number, take: number }} pagination
   * @returns {Promise<object[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async listAdmin(filters, pagination) { throw new Error('IJobRepository.listAdmin not implemented'); }

  /**
   * Count all job listings for admin view.
   * @param {{ listing_type?: string, is_active?: boolean }} filters
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line no-unused-vars
  async countAdmin(filters) { throw new Error('IJobRepository.countAdmin not implemented'); }
}
