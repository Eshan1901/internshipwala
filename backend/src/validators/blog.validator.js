/**
 * Blog Validators
 *
 * Zod schemas for blog endpoints.
 * Rules from Backend-Architecture.md Section 9.7.
 */

import { z } from 'zod';
import { zUuid, zPage, zLimit, zString, zContentStatus } from './common.js';

/**
 * POST /api/admin/blog — create a new blog post
 * From §9.7: title 3–300 chars, content min 100 chars, category_id UUID,
 *            status enum, slug optional/auto-generated
 */
export const createPostSchema = z.object({
  title: zString
    .min(3, 'Title must be at least 3 characters.')
    .max(300, 'Title must be at most 300 characters.'),

  content: z.string().trim().min(100, 'Content must be at least 100 characters.'),

  category_id: zUuid,

  status: zContentStatus,

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug must be URL-safe (lowercase letters, numbers, and hyphens only).')
    .optional(),

  thumbnail_url: z.string().trim().url('thumbnail_url must be a valid URL.').optional(),
}).strict();

/**
 * PUT /api/admin/blog/:id — update a blog post
 * All fields optional — only provided fields are updated.
 * Slug is preserved unchanged if not supplied (§documentation is silent on
 * auto-regeneration — preserve existing slug unless client explicitly provides one).
 */
export const updatePostSchema = z.object({
  title: zString
    .min(3, 'Title must be at least 3 characters.')
    .max(300, 'Title must be at most 300 characters.')
    .optional(),

  content: z.string().trim().min(100, 'Content must be at least 100 characters.').optional(),

  category_id: zUuid.optional(),

  status: zContentStatus.optional(),

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug must be URL-safe (lowercase letters, numbers, and hyphens only).')
    .optional(),

  thumbnail_url: z.string().trim().url('thumbnail_url must be a valid URL.').optional(),
})
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });

/**
 * POST /api/admin/blog/categories — create a blog category
 * slug auto-generated from name if absent (same pattern as posts)
 */
export const createCategorySchema = z.object({
  name: zString
    .min(2, 'Category name must be at least 2 characters.')
    .max(100, 'Category name must be at most 100 characters.'),

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug must be URL-safe.')
    .optional(),
}).strict();

/**
 * GET /api/blog — public listing query params
 */
export const listBlogQuerySchema = z.object({
  category: zUuid.optional(),
  page: zPage,
  limit: zLimit,
});

/**
 * Route param: blog post ID (for admin update/delete)
 */
export const blogIdParamSchema = z.object({
  id: zUuid,
});

/**
 * Route param: blog post slug (for public detail)
 */
export const blogSlugParamSchema = z.object({
  slug: z.string().trim().min(1, 'Slug is required.'),
});

/**
 * GET /api/admin/blog — admin list query params
 */
export const adminListBlogQuerySchema = z.object({
  status: zContentStatus.optional(),
  category: zUuid.optional(),
  page: zPage,
  limit: zLimit,
});
