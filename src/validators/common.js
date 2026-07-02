/**
 * Common Validation Primitives
 *
 * Reusable Zod field definitions shared across all validator schemas.
 * Import these instead of re-declaring the same rules in every file.
 *
 * Rules are derived directly from Backend-Architecture.md Section 9
 * and Database-Design.md column constraints.
 */

import { z } from 'zod';
import {
  CourseType,
  CourseStatus,
  ContentStatus,
  EnrollmentStatus,
  AssignmentType,
  JobListingType,
  ApplicationStatus,
  CollabStatus,
  ContactStatus,
  HardcopyStatus,
} from '../constants/enums.js';

// ── Primitives ────────────────────────────────────────────────────────────────

/** Non-empty trimmed string */
export const zString = z.string().trim().min(1, 'This field is required.');

/** Valid UUID v4 */
export const zUuid = z
  .string()
  .uuid('Must be a valid UUID.');

/** Valid email address */
export const zEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email('Must be a valid email address.');

/**
 * Indian mobile number — 10 to 15 digits only.
 * From Section 9.1: `mobile`: 10–15 chars, digits only.
 */
export const zMobile = z
  .string()
  .trim()
  .regex(/^\d{10,15}$/, 'Mobile number must be 10–15 digits.');

/**
 * Password field.
 * From Section 9.1: min 8 chars, at least 1 uppercase letter, at least 1 number.
 */
export const zPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.');

/**
 * 6-digit numeric OTP string.
 * From Section 9.1: `otp_code`: 6-digit numeric string.
 */
export const zOtpCode = z
  .string()
  .regex(/^\d{6}$/, 'OTP must be a 6-digit number.');

/**
 * OTP purpose enum.
 * Only two valid purposes exist in the system.
 */
export const zOtpPurpose = z.enum(['registration', 'password_reset'], {
  errorMap: () => ({ message: "Purpose must be 'registration' or 'password_reset'." }),
});

/**
 * Graduation year — 4-character numeric string (e.g. "2025").
 * From Section 9.1: `year_qualifying`: string, 4 chars numeric.
 */
export const zYearQualifying = z
  .string()
  .trim()
  .regex(/^\d{4}$/, 'Year must be a 4-digit number (e.g. 2025).');

/**
 * ISO date string.
 * Coerces to a Date object; used for dob validation.
 */
export const zDateString = z.coerce.date({
  errorMap: () => ({ message: 'Must be a valid date.' }),
});

/**
 * Date of birth — student must be at least 14 years old.
 * From Section 9.2 and Backend-Architecture.md Section 3.1.
 */
export const zDob = zDateString.refine(
  (date) => {
    const minAge = 14;
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - minAge);
    return date <= cutoff;
  },
  { message: 'You must be at least 14 years old.' }
);

/**
 * Positive integer — used for module_no, duration_weeks, max_marks etc.
 */
export const zPositiveInt = z.coerce
  .number()
  .int('Must be a whole number.')
  .positive('Must be a positive number.');

/**
 * Non-negative number — used for fees, amounts.
 */
export const zNonNegativeNumber = z.coerce
  .number()
  .nonnegative('Must be zero or a positive number.');

/**
 * Positive decimal — used for payment amounts, fees.
 */
export const zPositiveNumber = z.coerce
  .number()
  .positive('Must be a positive number.');

/**
 * Pagination — page number (1-based).
 */
export const zPage = z.coerce
  .number()
  .int()
  .positive()
  .default(1);

/**
 * Pagination — items per page (1–100).
 */
export const zLimit = z.coerce
  .number()
  .int()
  .min(1)
  .max(100)
  .default(10);

// ── Enum fields ───────────────────────────────────────────────────────────────

export const zCourseType = z.enum(
  Object.values(CourseType),
  { errorMap: () => ({ message: `Type must be one of: ${Object.values(CourseType).join(', ')}.` }) }
);

export const zCourseStatus = z.enum(
  Object.values(CourseStatus),
  { errorMap: () => ({ message: `Status must be one of: ${Object.values(CourseStatus).join(', ')}.` }) }
);

export const zContentStatus = z.enum(
  Object.values(ContentStatus),
  { errorMap: () => ({ message: `Status must be one of: ${Object.values(ContentStatus).join(', ')}.` }) }
);

export const zEnrollmentStatus = z.enum(
  Object.values(EnrollmentStatus),
  { errorMap: () => ({ message: `Status must be one of: ${Object.values(EnrollmentStatus).join(', ')}.` }) }
);

export const zAssignmentType = z.enum(
  Object.values(AssignmentType),
  { errorMap: () => ({ message: `Type must be one of: ${Object.values(AssignmentType).join(', ')}.` }) }
);

export const zJobListingType = z.enum(
  Object.values(JobListingType),
  { errorMap: () => ({ message: `Listing type must be one of: ${Object.values(JobListingType).join(', ')}.` }) }
);

export const zApplicationStatus = z.enum(
  Object.values(ApplicationStatus),
  { errorMap: () => ({ message: `Status must be one of: ${Object.values(ApplicationStatus).join(', ')}.` }) }
);

export const zCollabStatus = z.enum(
  Object.values(CollabStatus),
  { errorMap: () => ({ message: `Status must be one of: ${Object.values(CollabStatus).join(', ')}.` }) }
);

export const zContactStatus = z.enum(
  Object.values(ContactStatus),
  { errorMap: () => ({ message: `Status must be one of: ${Object.values(ContactStatus).join(', ')}.` }) }
);

export const zHardcopyStatus = z.enum(
  Object.values(HardcopyStatus),
  { errorMap: () => ({ message: `Status must be one of: ${Object.values(HardcopyStatus).join(', ')}.` }) }
);

// ── Reusable object shapes ────────────────────────────────────────────────────

/**
 * Standard pagination query parameters.
 * Use with: validate(paginationSchema, 'query')
 */
export const paginationSchema = z.object({
  page: zPage,
  limit: zLimit,
});

/**
 * Single UUID route parameter named `id`.
 * Use with: validate(idParamSchema, 'params')
 */
export const idParamSchema = z.object({
  id: zUuid,
});
