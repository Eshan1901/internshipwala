/**
 * Admin Blog Routes
 *
 * Mounted under /api/admin/blog by admin/index.js.
 * authenticateAdmin is already applied by the parent admin router.
 *
 * Routes (from Backend-Architecture.md §18.9):
 *   GET    /api/admin/blog
 *   POST   /api/admin/blog
 *   POST   /api/admin/blog/categories  — must be before /:id
 *   PUT    /api/admin/blog/:id
 *   DELETE /api/admin/blog/:id
 *
 * Permission: MANAGE_BLOG (from constants/permissions.js)
 * Matches Database-Design.md §10.3: ('Manage Blog', 'blog', 'create')
 */

import { Router } from 'express';

import { IBlogRepository } from '../../repositories/interfaces/IBlogRepository.js';
import { BlogService } from '../../services/blog.service.js';
import { BlogController } from '../../controllers/blog.controller.js';
import authorizePermission from '../../middlewares/authorizePermission.js';
import { validate } from '../../middlewares/validate.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { PERMISSIONS } from '../../constants/permissions.js';

import {
  createPostSchema,
  updatePostSchema,
  createCategorySchema,
  blogIdParamSchema,
  adminListBlogQuerySchema,
} from '../../validators/blog.validator.js';

// ── Dependency injection ──────────────────────────────────────────────────────
const blogRepo = new IBlogRepository();
const blogService = new BlogService(blogRepo);
const blogController = new BlogController(blogService);

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

// GET /api/admin/blog — any authenticated admin can view
router.get(
  '/',
  validate(adminListBlogQuerySchema, 'query'),
  asyncHandler(blogController.adminList)
);

// POST /api/admin/blog/categories — must be before /:id routes
router.post(
  '/categories',
  authorizePermission(PERMISSIONS.MANAGE_BLOG),
  validate(createCategorySchema),
  asyncHandler(blogController.adminCreateCategory)
);

// POST /api/admin/blog
router.post(
  '/',
  authorizePermission(PERMISSIONS.MANAGE_BLOG),
  validate(createPostSchema),
  asyncHandler(blogController.adminCreate)
);

// PUT /api/admin/blog/:id
router.put(
  '/:id',
  authorizePermission(PERMISSIONS.MANAGE_BLOG),
  validate(blogIdParamSchema, 'params'),
  validate(updatePostSchema),
  asyncHandler(blogController.adminUpdate)
);

// DELETE /api/admin/blog/:id
router.delete(
  '/:id',
  authorizePermission(PERMISSIONS.MANAGE_BLOG),
  validate(blogIdParamSchema, 'params'),
  asyncHandler(blogController.adminDelete)
);

export default router;
