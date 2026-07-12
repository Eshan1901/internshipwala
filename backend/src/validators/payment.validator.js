/**
 * Payment Validators
 *
 * Zod schemas for payment endpoints.
 * Rules from Backend-Architecture.md Section 9.5 and Section 4.5.
 */

import { z } from 'zod';
import { zUuid, zPage, zLimit, zPositiveNumber, zPaymentStatus } from './common.js';

/**
 * GET /api/payments/mine — query params (pagination only)
 */
export const myPaymentsQuerySchema = z.object({
  page: zPage,
  limit: zLimit,
});

/**
 * GET /api/admin/payments — query params
 * From §4.5: Query: status, page, limit
 */
export const adminListPaymentsQuerySchema = z.object({
  status: zPaymentStatus.optional(),
  page: zPage,
  limit: zLimit,
});

/**
 * PATCH /api/admin/payments/:id/confirm — request body
 * From Backend-Architecture.md §9.5: gateway_txn_id: required string, 3–200 chars
 */
export const confirmPaymentSchema = z.object({
  gateway_txn_id: z
    .string()
    .trim()
    .min(3, 'gateway_txn_id must be at least 3 characters.')
    .max(200, 'gateway_txn_id must be at most 200 characters.'),
}).strict();

/**
 * POST /api/admin/payments/:id/refund — request body
 * From Backend-Architecture.md §9.5:
 *   refund_amount: positive number ≤ original payment amount
 *   reason: required, 10–500 chars
 */
export const refundSchema = z.object({
  refund_amount: zPositiveNumber,
  reason: z
    .string()
    .trim()
    .min(10, 'Reason must be at least 10 characters.')
    .max(500, 'Reason must be at most 500 characters.'),
}).strict();

/**
 * Route param: payment ID
 */
export const paymentIdParamSchema = z.object({
  id: zUuid,
});
