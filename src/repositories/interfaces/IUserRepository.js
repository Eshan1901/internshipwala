/**
 * IUserRepository — User Repository Interface (Contract)
 *
 * Defines every data-access method the application layer requires for
 * the `users` table. The database developer implements this contract
 * using Prisma. Services depend only on this interface — never on any
 * concrete implementation.
 *
 * Soft-delete rule: every read method must exclude records where
 * deleted_at IS NOT NULL unless the method name explicitly says "withDeleted".
 */

export class IUserRepository {
  /**
   * Create a new user record.
   * @param {{ full_name: string, email: string, mobile: string, password_hash: string, college_name?: string, present_course?: string, year_qualifying?: string, state?: string, referral_code?: string }} data
   * @returns {Promise<object>} Created user (without password_hash)
   */
  // eslint-disable-next-line no-unused-vars
  async create(data) { throw new Error('IUserRepository.create not implemented'); }

  /**
   * Find an active (non-deleted) user by email.
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findByEmail(email) { throw new Error('IUserRepository.findByEmail not implemented'); }

  /**
   * Find an active (non-deleted) user by mobile number.
   * @param {string} mobile
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findByMobile(mobile) { throw new Error('IUserRepository.findByMobile not implemented'); }

  /**
   * Find an active (non-deleted) user by primary key.
   * @param {string} id - UUID
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findById(id) { throw new Error('IUserRepository.findById not implemented'); }

  /**
   * Update mutable fields on a user record.
   * @param {string} id - UUID
   * @param {Partial<object>} data
   * @returns {Promise<object>} Updated user (without password_hash)
   */
  // eslint-disable-next-line no-unused-vars
  async update(id, data) { throw new Error('IUserRepository.update not implemented'); }

  /**
   * Soft-delete a user by setting deleted_at to NOW().
   * @param {string} id - UUID
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async softDelete(id) { throw new Error('IUserRepository.softDelete not implemented'); }

  /**
   * Update the last_login_at timestamp to NOW().
   * @param {string} id - UUID
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async updateLastLogin(id) { throw new Error('IUserRepository.updateLastLogin not implemented'); }

  /**
   * List users with optional filters and pagination.
   * @param {{ is_active?: boolean, search?: string }} filters
   * @param {{ skip: number, take: number }} pagination
   * @returns {Promise<object[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async list(filters, pagination) { throw new Error('IUserRepository.list not implemented'); }

  /**
   * Count users matching optional filters.
   * @param {{ is_active?: boolean, search?: string }} filters
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line no-unused-vars
  async count(filters) { throw new Error('IUserRepository.count not implemented'); }
}
