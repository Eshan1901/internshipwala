/**
 * Certificate Validators
 *
 * Zod schemas for certificate endpoints.
 * Rules from Backend-Architecture.md Section 9.6 and Section 4.6.
 */

import { z } from 'zod';
import { zUuid, zPage, zLimit } from './common.js';

/**
 * Route param: certificate ID
 */
export const certificateIdParamSchema = z.object({
  id: zUuid,
});

/**
 * Route param: certificate number for public verification
 * From §4.6: GET /api/certificates/verify/:cert_number
 * cert_number is a string, not a UUID — validated as non-empty string.
 */
export const certNumberParamSchema = z.object({
  cert_number: z.string().trim().min(1, 'Certificate number is required.'),
});

/**
 * Route param: hard copy request ID
 * From §4.6: PATCH /api/admin/certificates/hard-copy/:requestId
 */
export const hardCopyRequestIdParamSchema = z.object({
  requestId: zUuid,
});

/**
 * PATCH /api/admin/certificates/hard-copy/:requestId — request body
 * Admin updates dispatch status of a hard copy request.
 * From Database-Design.md §5.19: status ENUM hardcopy_status
 */
export const updateHardCopyStatusSchema = z.object({
  status: z.enum(['pending', 'dispatched', 'delivered'], {
    errorMap: () => ({ message: "Status must be one of: pending, dispatched, delivered." }),
  }),
}).strict();

/**
 * GET /api/admin/certificates — query params
 */
export const adminListCertificatesQuerySchema = z.object({
  admin_approved: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  page: zPage,
  limit: zLimit,
});
