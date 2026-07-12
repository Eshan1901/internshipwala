/**
 * User Profile Validators
 *
 * Zod schemas for student profile update endpoints.
 * Field rules from Backend-Architecture.md Section 9.2.
 *
 * All fields are optional — partial updates are supported.
 * Fields that students are not permitted to change (is_verified, is_active,
 * referral_code, password_hash) are not defined here and are stripped
 * by the service layer even if somehow submitted.
 */

import { z } from 'zod';
import { zEmail, zMobile, zDob, zString } from './common.js';

/**
 * PUT /api/user/profile
 *
 * All fields optional. At least one field must be present
 * (enforced by .refine so empty bodies are rejected).
 */
export const updateProfileSchema = z
  .object({
    // Personal details
    full_name: zString
      .min(2, 'Full name must be at least 2 characters.')
      .max(150, 'Full name must be at most 150 characters.')
      .optional(),

    email: zEmail.optional(),

    mobile: zMobile.optional(),

    dob: zDob.optional(),

    address: z.string().trim().max(500, 'Address must be at most 500 characters.').optional(),

    city: z.string().trim().max(100, 'City must be at most 100 characters.').optional(),

    state: z.string().trim().max(100, 'State must be at most 100 characters.').optional(),

    country: z.string().trim().max(100, 'Country must be at most 100 characters.').optional(),

    father_name: z
      .string()
      .trim()
      .max(150, 'Father name must be at most 150 characters.')
      .optional(),

    // Academic details
    present_course: z
      .string()
      .trim()
      .max(100, 'Present course must be at most 100 characters.')
      .optional(),

    branch: z.string().trim().max(100, 'Branch must be at most 100 characters.').optional(),

    year_qualifying: z
      .string()
      .trim()
      .regex(/^\d{4}$/, 'Year qualifying must be a 4-digit year (e.g. 2025).')
      .optional(),

    college_name: z
      .string()
      .trim()
      .max(200, 'College name must be at most 200 characters.')
      .optional(),
  })
  .strict() // reject any keys not explicitly defined above
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });
