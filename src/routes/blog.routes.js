/**
 * Blog Routes — Public
 *
 * No authentication required on any of these routes.
 * Dependency injection: IBlogRepository → BlogService → BlogController.
 *
 * Routes (from Backend-Architecture.md §18.9):
 *   GET /api/blog
 *   GET /api/blog/categories   — must be before /:slug
 *   GET /api/blog/:slug
 */

import { Router } from 'express';

import { IBlogRepository } from '../repositories/interfaces/IBlogRepository.js';
import { BlogService } from '../services/blog.service.js';
import { BlogController } from '../controllers/blog.controller.js';
import { validate } from '../middlewares/validate.js';
import asyncHandler from '../utils/asyncHandler.js';

import {
  listBlogQuerySchema,
  blogSlugParamSchema,
} from '../validators/blog.validator.js';

// ── Dependency injection ──────────────────────────────────────────────────────
const blogRepo = new IBlogRepository();
const blogService = new BlogService(blogRepo);
const blogController = new BlogController(blogService);

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

// GET /api/blog
router.get(
  '/',
  validate(listBlogQuerySchema, 'query'),
  asyncHandler(blogController.listPublic)
);

// GET /api/blog/categories — must be before /:slug
router.get(
  '/categories',
  asyncHandler(blogController.listCategories)
);

// GET /api/blog/:slug
router.get(
  '/:slug',
  validate(blogSlugParamSchema, 'params'),
  asyncHandler(blogController.getBySlug)
);

export default router;
