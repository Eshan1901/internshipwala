/**
 * Job Validators
 *
 * Zod schemas for job listing and application endpoints.
 * Rules from Backend-Architecture.md §18.10 and Database-Design.md §5.20/5.21.
 */

import { z } from 'zod';
import { zUuid, zPage, zLimit, zString, zJobListingType } from './common.js';

/**
 * GET /api/jobs — public listing query params
 */
export const listJobsQuerySchema = z.object({
  type: zJobListingType.optional(),
  page: zPage,
  limit: zLimit,
});

/**
 * GET /api/admin/jobs — admin listing query params
 */
export const adminListJobsQuerySchema = z.object({
  type: zJobListingType.optional(),
  is_active: z
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

/**
 * POST /api/admin/jobs — create a job listing
 * From §5.20 column constraints.
 */
export const createJobSchema = z.object({
  title: zString
    .max(300, 'Title must be at most 300 characters.'),

  listing_type: zJobListingType,

  company: z.string().trim().max(200, 'Company must be at most 200 characters.').optional(),

  location: z.string().trim().max(200, 'Location must be at most 200 characters.').optional(),

  description: z.string().trim().optional(),

  eligibility: z.string().trim().optional(),

  apply_url: z.string().trim().url('apply_url must be a valid URL.').optional(),

  deadline: z.coerce.date().optional(),
}).strict();

/**
 * PUT /api/admin/jobs/:id — update a job listing
 * All fields optional.
 */
export const updateJobSchema = z.object({
  title: zString
    .max(300, 'Title must be at most 300 characters.')
    .optional(),

  listing_type: zJobListingType.optional(),

  company: z.string().trim().max(200).optional(),

  location: z.string().trim().max(200).optional(),

  description: z.string().trim().optional(),

  eligibility: z.string().trim().optional(),

  apply_url: z.string().trim().url('apply_url must be a valid URL.').optional(),

  deadline: z.coerce.date().optional(),

  is_active: z.boolean().optional(),
})
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });

/**
 * POST /api/jobs/:id/apply — student applies to a listing
 * cover_note and resume_url are both optional per §5.21.
 */
export const applyJobSchema = z.object({
  cover_note: z.string().trim().optional(),
  resume_url: z.string().trim().url('resume_url must be a valid URL.').optional(),
}).strict();

/**
 * Route param: job listing ID
 */
export const jobIdParamSchema = z.object({
  id: zUuid,
});

/**
 * GET /api/admin/jobs/:id/applicants — query params
 */
export const applicantsQuerySchema = z.object({
  page: zPage,
  limit: zLimit,
});
