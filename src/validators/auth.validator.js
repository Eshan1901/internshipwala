/**
 * Authentication Validators
 *
 * Zod schemas for every auth endpoint request body.
 * Rules from Backend-Architecture.md Section 9.1.
 *
 * Import the schema and pass it to validate() middleware in the route file:
 *   router.post('/register', validate(registerSchema), asyncHandler(controller.register));
 */

import { z } from 'zod';
import {
  zEmail,
  zMobile,
  zPassword,
  zOtpCode,
  zOtpPurpose,
  zString,
} from './common.js';

/**
 * POST /api/auth/register
 * From Section 9.1: full_name, email, mobile, password, college_name,
 * present_course, year_qualifying, state; referral_code optional.
 */
export const registerSchema = z.object({
  full_name: zString
    .min(2, 'Full name must be at least 2 characters.')
    .max(150, 'Full name must be at most 150 characters.'),

  email: zEmail,

  mobile: zMobile,

  password: zPassword,

  college_name: zString
    .min(2, 'College name must be at least 2 characters.')
    .max(200, 'College name must be at most 200 characters.'),

  present_course: zString
    .max(100, 'Present course must be at most 100 characters.'),

  year_qualifying: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'Year qualifying must be a 4-digit year (e.g. 2025).'),

  state: zString
    .max(100, 'State must be at most 100 characters.'),

  referral_code: z
    .string()
    .trim()
    .max(50, 'Referral code must be at most 50 characters.')
    .optional(),
});

/**
 * POST /api/auth/verify-otp
 */
export const verifyOtpSchema = z.object({
  email: zEmail,
  otp_code: zOtpCode,
  purpose: zOtpPurpose,
});

/**
 * POST /api/auth/resend-otp
 */
export const resendOtpSchema = z.object({
  email: zEmail,
  purpose: zOtpPurpose,
});

/**
 * POST /api/auth/login
 */
export const loginSchema = z.object({
  email: zEmail,
  password: z.string().min(1, 'Password is required.'),
});

/**
 * POST /api/auth/admin/login  (same shape as student login)
 */
export const adminLoginSchema = z.object({
  email: zEmail,
  password: z.string().min(1, 'Password is required.'),
});

/**
 * POST /api/auth/forgot-password
 */
export const forgotPasswordSchema = z.object({
  email: zEmail,
});

/**
 * POST /api/auth/reset-password
 */
export const resetPasswordSchema = z.object({
  email: zEmail,
  otp_code: zOtpCode,
  new_password: zPassword,
});

/**
 * PUT /api/auth/change-password  (requires student JWT)
 */
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required.'),
  new_password: zPassword,
});
