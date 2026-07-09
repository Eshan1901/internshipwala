/**
 * IPaymentRepository — Payment Repository Interface (Contract)
 *
 * Defines every data-access method the application layer requires for
 * the `payments` and `refunds` tables. The database developer implements
 * this contract using Prisma.
 *
 * Tables:
 *   payments  (Database-Design.md §5.16)
 *   refunds   (Database-Design.md §5.17)
 *
 * Critical transaction boundaries (from Backend-Architecture.md §16.2):
 *   confirmPayment() → $transaction(updatePayment + updateEnrollment)
 *   createRefund()   → $transaction(insertRefund + updatePayment)
 *
 * The application layer never orchestrates multiple repository calls for
 * these operations — the transaction boundary is owned by the repository.
 */

export class IPaymentRepository {
  /**
   * Find a payment by primary key.
   * Includes the related enrollment and user records.
   * @param {string} id - UUID
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findById(id) { throw new Error('IPaymentRepository.findById not implemented'); }

  /**
   * Find the payment linked to a specific enrollment.
   * @param {string} enrollmentId - UUID
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findByEnrollmentId(enrollmentId) { throw new Error('IPaymentRepository.findByEnrollmentId not implemented'); }

  /**
   * List payments for a specific student, newest first.
   * @param {string} userId
   * @param {{ skip: number, take: number }} pagination
   * @returns {Promise<object[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async listByUser(userId, pagination) { throw new Error('IPaymentRepository.listByUser not implemented'); }

  /**
   * Count payments for a specific student.
   * @param {string} userId
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line no-unused-vars
  async countByUser(userId) { throw new Error('IPaymentRepository.countByUser not implemented'); }

  /**
   * List all payments for admin view with optional status filter.
   * @param {{ status?: string }} filters
   * @param {{ skip: number, take: number }} pagination
   * @returns {Promise<object[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async listAdmin(filters, pagination) { throw new Error('IPaymentRepository.listAdmin not implemented'); }

  /**
   * Count payments for admin view with optional status filter.
   * @param {{ status?: string }} filters
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line no-unused-vars
  async countAdmin(filters) { throw new Error('IPaymentRepository.countAdmin not implemented'); }

  /**
   * Atomically confirm a payment and activate the linked enrollment.
   *
   * TRANSACTION BOUNDARY (from Backend-Architecture.md §16.2 sequence diagram):
   *   $transaction(updatePayment + updateEnrollment)
   *
   * The database implementation MUST execute both updates in a single
   * transaction. If either update fails, both must roll back.
   *
   * Sets on payment:   status='success', gateway_txn_id, paid_at=NOW()
   * Sets on enrollment: status='active'
   *
   * @param {string} paymentId - UUID
   * @param {string} enrollmentId - UUID of the linked enrollment
   * @param {string} gatewayTxnId - Gateway transaction ID from admin confirmation
   * @returns {Promise<object>} Updated payment record
   */
  // eslint-disable-next-line no-unused-vars
  async confirmPayment(paymentId, enrollmentId, gatewayTxnId) { throw new Error('IPaymentRepository.confirmPayment not implemented'); }

  /**
   * Mark a payment as failed (admin rejection).
   * Sets payment status='failed'.
   * @param {string} paymentId - UUID
   * @returns {Promise<object>} Updated payment record
   */
  // eslint-disable-next-line no-unused-vars
  async rejectPayment(paymentId) { throw new Error('IPaymentRepository.rejectPayment not implemented'); }

  /**
   * Atomically create a refund record and mark the payment as refunded.
   *
   * TRANSACTION BOUNDARY (from Backend-Architecture.md §6.5):
   *   "Insert into refunds; run in transaction with payment update"
   *
   * Sets on payment: status='refunded'
   * Inserts into refunds: new refund row
   *
   * @param {{
   *   payment_id: string,
   *   initiated_by: string,
   *   refund_amount: number,
   *   gateway_fee_deducted: number,
   *   reason?: string
   * }} data
   * @returns {Promise<object>} Created refund record
   */
  // eslint-disable-next-line no-unused-vars
  async createRefund(data) { throw new Error('IPaymentRepository.createRefund not implemented'); }
}
