/**
 * Payment Controller
 *
 * HTTP boundary for payment management operations.
 * No business logic. No direct data access.
 * Responsibilities: parse request → call PaymentService → return response.
 *
 * Endpoints (from Backend-Architecture.md §4.5):
 *   GET   /api/payments/mine
 *   GET   /api/admin/payments
 *   PATCH /api/admin/payments/:id/confirm
 *   PATCH /api/admin/payments/:id/reject
 *   POST  /api/admin/payments/:id/refund
 */

import { sendSuccess } from '../utils/response.js';
import { MESSAGES } from '../constants/messages.js';

export class PaymentController {
  /**
   * @param {import('../services/payment.service.js').PaymentService} paymentService
   */
  constructor(paymentService) {
    this.paymentService = paymentService;
  }

  /**
   * GET /api/payments/mine
   * Returns the authenticated student's payment history.
   */
  myPayments = async (req, res, next) => {
    try {
      const { payments, meta } = await this.paymentService.myPayments(req.user.id, req.query);
      return sendSuccess(res, 200, MESSAGES.PAYMENTS_FETCHED, payments, meta);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * GET /api/admin/payments
   * Lists all payments for admin view.
   */
  adminList = async (req, res, next) => {
    try {
      const { payments, meta } = await this.paymentService.adminList(req.query);
      return sendSuccess(res, 200, MESSAGES.PAYMENTS_FETCHED, payments, meta);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * PATCH /api/admin/payments/:id/confirm
   * Confirms a payment and activates the linked enrollment.
   */
  adminConfirm = async (req, res, next) => {
    try {
      const payment = await this.paymentService.confirmPayment(
        req.admin.id,
        req.params.id,
        req.body.gateway_txn_id
      );
      return sendSuccess(res, 200, MESSAGES.PAYMENT_CONFIRMED, payment);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * PATCH /api/admin/payments/:id/reject
   * Rejects (marks as failed) a payment.
   */
  adminReject = async (req, res, next) => {
    try {
      const payment = await this.paymentService.rejectPayment(req.admin.id, req.params.id);
      return sendSuccess(res, 200, MESSAGES.PAYMENT_REJECTED, payment);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * POST /api/admin/payments/:id/refund
   * Initiates a refund after eligibility check.
   */
  adminRefund = async (req, res, next) => {
    try {
      const refund = await this.paymentService.initiateRefund(
        req.admin.id,
        req.params.id,
        req.body
      );
      return sendSuccess(res, 201, MESSAGES.REFUND_INITIATED, refund);
    } catch (err) {
      return next(err);
    }
  };
}
