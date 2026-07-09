/**
 * Payment Service
 *
 * All business logic for payment management.
 * Depends on IPaymentRepository and NotificationService.
 * Never touches req/res. Never imports Prisma.
 *
 * Methods (from Backend-Architecture.md §5.4):
 *   myPayments(userId, rawQuery)
 *   adminList(rawQuery)
 *   confirmPayment(adminId, paymentId, gatewayTxnId)
 *   rejectPayment(adminId, paymentId)
 *   initiateRefund(adminId, paymentId, dto)
 *
 * Transaction boundaries:
 *   confirmPayment → single atomic repo call (updatePayment + updateEnrollment)
 *   initiateRefund → single atomic repo call (insertRefund + updatePayment)
 *   Both boundaries are owned by the repository layer per §16.2.
 *
 * Gateway integration is OUT OF SCOPE for v1 (§18.6):
 *   All payment confirmation is manual by admin.
 *
 * Business rules (from §3.6 and §5.4):
 *   - Refund eligible if enrollment < 7 days old and course hasn't started
 *   - Refund eligible if student completed fewer than 2 modules
 *   - Otherwise refund not eligible
 */

import { AppError } from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';
import { parsePaginationQuery, buildPaginationMeta } from '../utils/pagination.js';
import { PaymentStatus } from '../constants/enums.js';
import logger from '../logger/logger.js';

export class PaymentService {
  /**
   * @param {import('../repositories/interfaces/IPaymentRepository.js').IPaymentRepository} paymentRepo
   * @param {import('./notification.service.js').NotificationService} notificationService
   */
  constructor(paymentRepo, notificationService) {
    this.paymentRepo = paymentRepo;
    this.notificationService = notificationService;
  }

  // ── Student: my payments ───────────────────────────────────────────────────

  /**
   * List the authenticated student's own payment history, paginated.
   *
   * From §4.5: GET /api/payments/mine — Query: pagination — Student JWT
   *
   * @param {string} userId
   * @param {object} rawQuery - req.query (page, limit)
   * @returns {Promise<{ payments: object[], meta: object }>}
   */
  async myPayments(userId, rawQuery) {
    const { page, limit, skip, take } = parsePaginationQuery(rawQuery);

    const [payments, total] = await Promise.all([
      this.paymentRepo.listByUser(userId, { skip, take }),
      this.paymentRepo.countByUser(userId),
    ]);

    return { payments, meta: buildPaginationMeta(total, page, limit) };
  }

  // ── Admin: list payments ───────────────────────────────────────────────────

  /**
   * List all payments for admin view with optional status filter, paginated.
   *
   * From §4.5: GET /api/admin/payments — Query: status, page, limit — Admin
   *
   * @param {object} rawQuery - req.query (status, page, limit)
   * @returns {Promise<{ payments: object[], meta: object }>}
   */
  async adminList(rawQuery) {
    const { page, limit, skip, take } = parsePaginationQuery(rawQuery);

    const filters = { status: rawQuery.status };

    const [payments, total] = await Promise.all([
      this.paymentRepo.listAdmin(filters, { skip, take }),
      this.paymentRepo.countAdmin(filters),
    ]);

    return { payments, meta: buildPaginationMeta(total, page, limit) };
  }

  // ── Admin: confirm payment ─────────────────────────────────────────────────

  /**
   * Confirm a payment and atomically activate the linked enrollment.
   *
   * From §5.4:
   *   "Set payment status='success', gateway_txn_id, paid_at; activate enrollment; notify student"
   *
   * From §16.2 sequence diagram:
   *   PS->>DB: $transaction(updatePayment + updateEnrollment + logActivity)
   *   PS->>NS: send(enrollment.user_id, 'Course Access Activated', ...)
   *
   * The repository's confirmPayment() method executes the payment update and
   * enrollment activation in one atomic transaction. The service calls it once.
   *
   * @param {string} adminId
   * @param {string} paymentId
   * @param {string} gatewayTxnId
   * @returns {Promise<object>} Updated payment record
   */
  async confirmPayment(adminId, paymentId, gatewayTxnId) {
    const payment = await this.paymentRepo.findById(paymentId);

    if (!payment) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new AppError(400, `Payment cannot be confirmed from status '${payment.status}'.`);
    }

    // Single atomic operation: update payment + activate enrollment
    const updated = await this.paymentRepo.confirmPayment(
      paymentId,
      payment.enrollment_id,
      gatewayTxnId
    );

    // One notification: "Course Access Activated" (from §15.4 and §16.2)
    this.notificationService
      .send(
        payment.user_id,
        'Course Access Activated',
        'Your payment has been confirmed. You now have full access to your course.',
        'payment'
      )
      .catch((err) => logger.error('Failed to send payment confirmation notification', { error: err.message }));

    logger.info('Payment confirmed', { paymentId, adminId });

    return updated;
  }

  // ── Admin: reject payment ─────────────────────────────────────────────────

  /**
   * Reject a payment (mark as failed).
   *
   * From §5.4:
   *   "Set payment status='failed'; notify student"
   *
   * From §15.4:
   *   "Payment rejected → Notify student: payment rejected"
   *
   * @param {string} adminId
   * @param {string} paymentId
   * @returns {Promise<object>} Updated payment record
   */
  async rejectPayment(adminId, paymentId) {
    const payment = await this.paymentRepo.findById(paymentId);

    if (!payment) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new AppError(400, `Payment cannot be rejected from status '${payment.status}'.`);
    }

    const updated = await this.paymentRepo.rejectPayment(paymentId);

    this.notificationService
      .send(
        payment.user_id,
        'Payment Rejected',
        'Your payment could not be verified. Please contact support.',
        'payment'
      )
      .catch((err) => logger.error('Failed to send payment rejection notification', { error: err.message }));

    logger.info('Payment rejected', { paymentId, adminId });

    return updated;
  }

  // ── Admin: initiate refund ────────────────────────────────────────────────

  /**
   * Initiate a refund after verifying eligibility.
   *
   * From §5.4:
   *   "Validate payment is 'success'; check refund eligibility rules;
   *    create refunds record; set payment status='refunded'"
   *
   * Eligibility rules (from §5.4):
   *   1. Enrollment enrolled_at < NOW() - 7 days AND course hasn't started → eligible
   *   2. Student completed fewer than 2 modules → eligible
   *   3. Otherwise → AppError(400, 'Refund conditions not met')
   *
   * Note: Rule evaluation requires enrollment and progress data. The payment
   * repository returns the enrollment record (including enrolled_at and
   * module_progress count) as part of findById. The service applies the rules.
   *
   * The repository's createRefund() inserts the refund row and updates the
   * payment status atomically (from §6.5: "run in transaction with payment update").
   *
   * @param {string} adminId
   * @param {string} paymentId
   * @param {{ refund_amount: number, reason: string }} dto
   * @returns {Promise<object>} Created refund record
   */
  async initiateRefund(adminId, paymentId, dto) {
    const payment = await this.paymentRepo.findById(paymentId);

    if (!payment) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new AppError(400, 'Only successful payments can be refunded.');
    }

    // ── Eligibility check ──────────────────────────────────────────────────
    const enrollment = payment.enrollment;

    if (!enrollment) {
      throw new AppError(400, 'No enrollment linked to this payment.');
    }

    const enrolledAt = new Date(enrollment.enrolled_at);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Rule 1: enrolled less than 7 days ago
    const enrolledWithin7Days = enrolledAt > sevenDaysAgo;

    // Rule 2: fewer than 2 modules completed (progress count on enrollment)
    const completedModules = Array.isArray(enrollment.module_progress)
      ? enrollment.module_progress.filter((p) => p.is_completed).length
      : 0;
    const completedFewerThan2 = completedModules < 2;

    const isEligible = enrolledWithin7Days || completedFewerThan2;

    if (!isEligible) {
      throw new AppError(400, 'Refund conditions not met.');
    }

    // Validate refund_amount does not exceed payment amount
    if (dto.refund_amount > Number(payment.amount)) {
      throw new AppError(400, 'Refund amount cannot exceed the original payment amount.');
    }

    // Single atomic operation: insert refund + update payment to 'refunded'
    const refund = await this.paymentRepo.createRefund({
      payment_id: paymentId,
      initiated_by: adminId,
      refund_amount: dto.refund_amount,
      gateway_fee_deducted: 0,
      reason: dto.reason,
    });

    logger.info('Refund initiated', { paymentId, adminId, amount: dto.refund_amount });

    return refund;
  }
}
