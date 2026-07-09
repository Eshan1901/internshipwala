/**
 * ICertificateRepository — Certificate Repository Interface (Contract)
 *
 * Defines every data-access method the application layer requires for
 * the `certificates` and `certificate_hard_copy_requests` tables.
 * The database developer implements this contract using Prisma.
 *
 * Tables:
 *   certificates                    (Database-Design.md §5.18)
 *   certificate_hard_copy_requests  (Database-Design.md §5.19)
 *
 * Uniqueness constraints (from §5.18):
 *   UNIQUE (cert_number)   — supports public verification lookup
 *   UNIQUE (enrollment_id) — one certificate per enrollment
 *
 * Certificate number generation (from Backend-Architecture.md §18.7):
 *   The service queries findLatestCertNumberForYear() to determine the
 *   next sequence, then calls create(). If create() throws a P2002
 *   (unique constraint on cert_number), the service retries with an
 *   incremented sequence.
 */

export class ICertificateRepository {
  /**
   * Insert a new certificate record.
   * cert_number must be globally unique — the DB UNIQUE constraint is the
   * safety net against race conditions.
   *
   * @param {{
   *   user_id: string,
   *   enrollment_id: string,
   *   cert_number: string
   * }} data
   * @returns {Promise<object>} Created certificate record
   */
  // eslint-disable-next-line no-unused-vars
  async create(data) { throw new Error('ICertificateRepository.create not implemented'); }

  /**
   * Find the highest existing cert_number for a given year.
   * Used by CertificateService to compute the next sequence number.
   * Returns null if no certificate has been issued for that year yet.
   *
   * Format queried: 'IW-{year}-%'
   *
   * @param {number} year - 4-digit year (e.g. 2026)
   * @returns {Promise<string|null>} cert_number string or null
   */
  // eslint-disable-next-line no-unused-vars
  async findLatestCertNumberForYear(year) { throw new Error('ICertificateRepository.findLatestCertNumberForYear not implemented'); }

  /**
   * Find a certificate by its human-readable certificate number.
   * Used for the public verification endpoint.
   * Includes related user and course data.
   *
   * @param {string} certNumber - e.g. "IW-2026-000042"
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findByCertNumber(certNumber) { throw new Error('ICertificateRepository.findByCertNumber not implemented'); }

  /**
   * List all certificates belonging to a specific student.
   * @param {string} userId
   * @returns {Promise<object[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async findByUserId(userId) { throw new Error('ICertificateRepository.findByUserId not implemented'); }

  /**
   * Find a certificate by its primary key.
   * Includes related user, enrollment, and course data.
   * @param {string} id - UUID
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findById(id) { throw new Error('ICertificateRepository.findById not implemented'); }

  /**
   * Approve a certificate: set admin_approved=TRUE and issued_at=NOW().
   * @param {string} id - UUID
   * @returns {Promise<object>} Updated certificate record
   */
  // eslint-disable-next-line no-unused-vars
  async approve(id) { throw new Error('ICertificateRepository.approve not implemented'); }

  /**
   * List all certificates for admin view with optional filters and pagination.
   * @param {{ admin_approved?: boolean }} filters
   * @param {{ skip: number, take: number }} pagination
   * @returns {Promise<object[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async listAdmin(filters, pagination) { throw new Error('ICertificateRepository.listAdmin not implemented'); }

  /**
   * Count certificates for admin view with optional filters.
   * @param {{ admin_approved?: boolean }} filters
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line no-unused-vars
  async countAdmin(filters) { throw new Error('ICertificateRepository.countAdmin not implemented'); }

  /**
   * Update the dispatch status of a hard copy request.
   * Used by admin to mark dispatched or delivered.
   *
   * @param {string} requestId - UUID of the hard copy request
   * @param {string} status - HardcopyStatus enum value
   * @returns {Promise<object>} Updated hard copy request record
   */
  // eslint-disable-next-line no-unused-vars
  async updateHardCopyStatus(requestId, status) { throw new Error('ICertificateRepository.updateHardCopyStatus not implemented'); }

  /**
   * Find a hard copy request by its primary key.
   * Used to verify ownership before admin update.
   * @param {string} requestId - UUID
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findHardCopyRequestById(requestId) { throw new Error('ICertificateRepository.findHardCopyRequestById not implemented'); }

  /**
   * Insert a new hard copy request for a certificate.
   *
   * NOTE: This method is part of the complete Certificate aggregate contract
   * per Database-Design.md §5.19. The service method that calls it
   * (requestHardCopy) is deferred to Phase 15 because shipping_fee must be
   * fetched from the settings table (Backend-Architecture.md §5.5) and
   * ISettingsRepository is not yet available.
   *
   * @param {{
   *   certificate_id: string,
   *   user_id: string,
   *   shipping_fee: number,
   *   shipping_address: string
   * }} data
   * @returns {Promise<object>} Created hard copy request record
   */
  // eslint-disable-next-line no-unused-vars
  async createHardCopyRequest(data) { throw new Error('ICertificateRepository.createHardCopyRequest not implemented'); }
}
