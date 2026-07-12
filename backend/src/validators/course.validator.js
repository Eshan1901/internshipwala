/**
 * Course Validation Schemas
 *
 * Request validation for public course endpoints.
 */

import { z } from 'zod';
import { zCourseType, zLimit, zPage, zUuid } from './common.js';

export const listPublicCoursesQuerySchema = z
  .object({
    category: zUuid.optional(),
    type: zCourseType.optional(),
    page: zPage,
    limit: zLimit,
  })
  .strict();

export const courseIdParamSchema = z.object({
  id: zUuid,
});
