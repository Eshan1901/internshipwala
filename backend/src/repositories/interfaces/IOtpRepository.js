/**
 * IOtpRepository — OTP Repository Interface (Contract)
 *
 * Defines every data-access method the application layer requires for
 * the `otp_verifications` table. The database developer implements this
 * contract using Prisma.
 */

export class IOtpRepository {
  /**
   * Store a new OTP verification record.
   * @param {{ target: string, otp_code: string, purpose: string, expires_at: Date }} data
   * @returns {Promise<object>} Created OTP record
   */
  // eslint-disable-next-line no-unused-vars
  async create(data) { throw new Error('IOtpRepository.create not implemented'); }

  /**
   * Find a valid (unused, non-expired) OTP matching target + purpose + code.
   * @param {string} target - Email or mobile
   * @param {string} purpose - 'registration' | 'password_reset'
   * @param {string} otp_code - 6-digit code submitted by the user
   * @returns {Promise<object|null>} OTP record or null
   */
  // eslint-disable-next-line no-unused-vars
  async findValid(target, purpose, otp_code) { throw new Error('IOtpRepository.findValid not implemented'); }

  /**
   * Mark an OTP record as used so it cannot be replayed.
   * @param {string} id - UUID of the OTP record
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async markUsed(id) { throw new Error('IOtpRepository.markUsed not implemented'); }

  /**
   * Invalidate all unused OTPs for a given target + purpose.
   * Called before issuing a new OTP so only one is ever active at a time.
   * @param {string} target
   * @param {string} purpose
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async invalidateOld(target, purpose) { throw new Error('IOtpRepository.invalidateOld not implemented'); }

  /**
   * Delete all expired OTP records.
   * Called by the OTP cleanup cron job every 30 minutes.
   * @returns {Promise<number>} Count of deleted records
   */
  async deleteExpired() { throw new Error('IOtpRepository.deleteExpired not implemented'); }
}
