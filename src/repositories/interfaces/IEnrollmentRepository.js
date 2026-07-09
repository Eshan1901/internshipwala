/**
 * IEnrollmentRepository — Enrollment Repository Interface (Contract)
 *
 * Defines every data-access method the application layer requires for
 * the `enrollments` and `payments` tables. The database developer
 * implements this contract using Prisma.
 *
 * Tables: enrollments (Database-Design.md §5.13), payments (§5.16)
 *
 * Critical note (Database-Design.md §5.13 CRITICAL-1):
 *   The uniqueness constraint is a partial index, not a table-level UNIQUE:
 *   CREATE UNIQUE INDEX uq_active_enrollment ON enrollments (user_id, course_id)
 *   WHERE deleted_at IS NULL AND status != 'cancelled';
 *   The repository implementation must handle Prisma P2002 on this index.
 *
 * Soft-delete rule: enrollments are soft-deleted — always filter
 * deleted_at IS NULL in standard queries.
 */

export class IEnrollmentRepository {
  /**
   * Create an enrollment and its initial payment record atomically.
   * Both rows must succeed or both must roll back (transaction).
   *
   * From Backend-Architecture.md §5.3:
   *   "create enrollment + payment in $transaction"
   *
   * @param {{ user_id: string, course_id: string, duration_fee_id: string, fee_paid: number }} enrollmentData
   * @param {{ user_id: string, enrollment_id: string, amount: number }} paymentData
   * @returns {Promise<{ enrollment: object, payment: object }>}
   */
  // eslint-disable-next-line no-unused-vars
  async createWithPayment(enrollmentData, paymentData) { throw new Error('IEnrollmentRepository.createWithPayment not implemented'); }

  /**
   * Find an enrollment by primary key.
   * Includes the related user, course, and payment records.
   * @param {string} id - UUID
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findById(id) { throw new Error('IEnrollmentRepository.findById not implemented'); }

  /**
   * Find an active (non-cancelled, non-deleted) enrollment for a
   * specific user + course combination.
   * Used to enforce the uq_active_enrollment constraint in the service.
   * @param {string} userId
   * @param {string} courseId
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findByUserAndCourse(userId, courseId) { throw new Error('IEnrollmentRepository.findByUserAndCourse not implemented'); }

  /**
   * List all enrollments for a specific student.
   * Includes course summary. Optionally filters by status.
   * @param {string} userId
   * @param {string|null} statusFilter - EnrollmentStatus value or null for all
   * @returns {Promise<object[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async findUserEnrollments(userId, statusFilter) { throw new Error('IEnrollmentRepository.findUserEnrollments not implemented'); }

  /**
   * List all enrollments for admin view with optional filters and pagination.
   * @param {{ status?: string, user_id?: string, course_id?: string }} filters
   * @param {{ skip: number, take: number }} pagination
   * @returns {Promise<object[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async listAdmin(filters, pagination) { throw new Error('IEnrollmentRepository.listAdmin not implemented'); }

  /**
   * Count enrollments for admin view with optional filters.
   * @param {{ status?: string, user_id?: string, course_id?: string }} filters
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line no-unused-vars
  async countAdmin(filters) { throw new Error('IEnrollmentRepository.countAdmin not implemented'); }

  /**
   * Update enrollment status. Sets completed_at when status = 'completed'.
   * @param {string} id - UUID
   * @param {string} status - EnrollmentStatus value
   * @returns {Promise<object>} Updated enrollment
   */
  // eslint-disable-next-line no-unused-vars
  async updateStatus(id, status) { throw new Error('IEnrollmentRepository.updateStatus not implemented'); }

  /**
   * Soft-delete an enrollment by setting deleted_at = NOW().
   * @param {string} id - UUID
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async softDelete(id) { throw new Error('IEnrollmentRepository.softDelete not implemented'); }
}
