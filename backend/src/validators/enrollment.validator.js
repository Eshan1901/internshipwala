/**
 * Enrollment Validators
 *
 * Zod schemas for enrollment endpoints.
 * Rules from Backend-Architecture.md Section 9.4 and Section 4.4.
 */

import { z } from 'zod';
import { zUuid, zPage, zLimit, zEnrollmentStatus } from './common.js';

/**
 * POST /api/enrollments — request body
 * From Backend-Architecture.md §9.4: course_id and duration_fee_id are required UUIDs.
 */
export const enrollSchema = z.object({
  course_id: zUuid,
  duration_fee_id: zUuid,
}).strict();

/**
 * GET /api/enrollments/mine — query params
 * Optional status filter + pagination.
 */
export const myEnrollmentsQuerySchema = z.object({
  status: zEnrollmentStatus.optional(),
  page: zPage,
  limit: zLimit,
});

/**
 * GET /api/admin/enrollments — query params
 */
export const adminListEnrollmentsQuerySchema = z.object({
  status: zEnrollmentStatus.optional(),
  user_id: zUuid.optional(),
  course_id: zUuid.optional(),
  page: zPage,
  limit: zLimit,
});

/**
 * Route param: enrollment ID
 */
export const enrollmentIdParamSchema = z.object({
  id: zUuid,
});

/**
 * Route params: enrollment ID + module ID
 * Used by getModules and markModuleComplete.
 */
export const enrollmentModuleParamSchema = z.object({
  id: zUuid,
  moduleId: zUuid,
});

/**
 * Route params: enrollment ID + assignment ID
 * Used by submitAssignment.
 */
export const enrollmentAssignmentParamSchema = z.object({
  id: zUuid,
  assignmentId: zUuid,
});

/**
 * POST /api/enrollments/:id/assignments/:assignmentId/submit — request body
 * answer_text and file_url are both optional — at least one must be present.
 * From Backend-Architecture.md §4.4: "Body/file".
 */
export const submitAssignmentSchema = z.object({
  answer_text: z.string().trim().min(1).optional(),
  file_url: z.string().trim().url('file_url must be a valid URL.').optional(),
}).strict().refine(
  (data) => data.answer_text !== undefined || data.file_url !== undefined,
  { message: 'At least one of answer_text or file_url must be provided.' }
);
