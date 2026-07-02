/**
 * IAdminRepository — Admin Repository Interface (Contract)
 *
 * Defines every data-access method the application layer requires for
 * the `admin_users`, `roles`, `permissions`, `role_permissions`, and
 * `admin_user_roles` tables.
 *
 * Soft-delete rule: login and active-user queries must filter
 * WHERE deleted_at IS NULL. Admin accounts are NEVER hard-deleted.
 */

export class IAdminRepository {
  /**
   * Find an active (non-deleted) admin by email.
   * Used during admin login.
   * Returns the admin record with roles and permissions arrays populated.
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findByEmail(email) { throw new Error('IAdminRepository.findByEmail not implemented'); }

  /**
   * Find an active (non-deleted) admin by primary key.
   * Returns the admin record with roles and permissions arrays populated.
   * @param {string} id - UUID
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findById(id) { throw new Error('IAdminRepository.findById not implemented'); }

  /**
   * Create a new admin account.
   * @param {{ full_name: string, email: string, password_hash: string }} data
   * @returns {Promise<object>} Created admin (without password_hash)
   */
  // eslint-disable-next-line no-unused-vars
  async create(data) { throw new Error('IAdminRepository.create not implemented'); }

  /**
   * Update mutable fields on an admin record.
   * @param {string} id - UUID
   * @param {Partial<object>} data
   * @returns {Promise<object>} Updated admin (without password_hash)
   */
  // eslint-disable-next-line no-unused-vars
  async update(id, data) { throw new Error('IAdminRepository.update not implemented'); }

  /**
   * Soft-delete an admin by setting deleted_at = NOW() and is_active = FALSE.
   * Never hard-deletes — activity_logs references admin_user_id with ON DELETE RESTRICT.
   * @param {string} id - UUID
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async softDelete(id) { throw new Error('IAdminRepository.softDelete not implemented'); }

  /**
   * Update the last_login_at timestamp for an admin.
   * @param {string} id - UUID
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async updateLastLogin(id) { throw new Error('IAdminRepository.updateLastLogin not implemented'); }

  /**
   * List all non-deleted admins with pagination.
   * @param {{ skip: number, take: number }} pagination
   * @returns {Promise<object[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async list(pagination) { throw new Error('IAdminRepository.list not implemented'); }

  /**
   * Assign a role to an admin user.
   * @param {string} adminId - UUID
   * @param {string} roleId - UUID
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async assignRole(adminId, roleId) { throw new Error('IAdminRepository.assignRole not implemented'); }

  /**
   * Remove a role from an admin user.
   * @param {string} adminId - UUID
   * @param {string} roleId - UUID
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async removeRole(adminId, roleId) { throw new Error('IAdminRepository.removeRole not implemented'); }

  /**
   * Count all non-deleted admin accounts.
   * @returns {Promise<number>}
   */
  async count() { throw new Error('IAdminRepository.count not implemented'); }
}
