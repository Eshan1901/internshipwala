/**
 * Blog Controller
 *
 * HTTP boundary for blog operations.
 * No business logic. No direct data access.
 * Responsibilities: parse request → call BlogService → return response.
 *
 * Endpoints (from Backend-Architecture.md §18.9):
 *   GET  /api/blog
 *   GET  /api/blog/categories
 *   GET  /api/blog/:slug
 *   POST /api/admin/blog
 *   PUT  /api/admin/blog/:id
 *   DELETE /api/admin/blog/:id
 *   POST /api/admin/blog/categories
 */

import { sendSuccess } from '../utils/response.js';
import { MESSAGES } from '../constants/messages.js';

export class BlogController {
  /**
   * @param {import('../services/blog.service.js').BlogService} blogService
   */
  constructor(blogService) {
    this.blogService = blogService;
  }

  /**
   * GET /api/blog
   * Paginated public listing of published posts.
   */
  listPublic = async (req, res, next) => {
    try {
      const { posts, meta } = await this.blogService.listPublic(req.query);
      return sendSuccess(res, 200, MESSAGES.BLOGS_FETCHED, posts, meta);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * GET /api/blog/categories
   * List all active blog categories.
   */
  listCategories = async (_req, res, next) => {
    try {
      const categories = await this.blogService.listCategories();
      return sendSuccess(res, 200, MESSAGES.CATEGORIES_FETCHED, categories);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * GET /api/blog/:slug
   * Public post detail by slug.
   */
  getBySlug = async (req, res, next) => {
    try {
      const post = await this.blogService.getBySlug(req.params.slug);
      return sendSuccess(res, 200, MESSAGES.BLOG_FETCHED, post);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * GET /api/admin/blog
   * Admin paginated list of all posts.
   */
  adminList = async (req, res, next) => {
    try {
      const { posts, meta } = await this.blogService.adminList(req.query);
      return sendSuccess(res, 200, MESSAGES.BLOGS_FETCHED, posts, meta);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * POST /api/admin/blog
   * Create a new blog post.
   */
  adminCreate = async (req, res, next) => {
    try {
      const post = await this.blogService.adminCreate(req.admin.id, req.body);
      return sendSuccess(res, 201, MESSAGES.BLOG_CREATED, post);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * PUT /api/admin/blog/:id
   * Update an existing blog post.
   */
  adminUpdate = async (req, res, next) => {
    try {
      const post = await this.blogService.adminUpdate(req.admin.id, req.params.id, req.body);
      return sendSuccess(res, 200, MESSAGES.BLOG_UPDATED, post);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * DELETE /api/admin/blog/:id
   * Soft-delete a blog post.
   */
  adminDelete = async (req, res, next) => {
    try {
      await this.blogService.adminDelete(req.admin.id, req.params.id);
      return sendSuccess(res, 200, MESSAGES.BLOG_DELETED);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * POST /api/admin/blog/categories
   * Create a new blog category.
   */
  adminCreateCategory = async (req, res, next) => {
    try {
      const category = await this.blogService.adminCreateCategory(req.admin.id, req.body);
      return sendSuccess(res, 201, MESSAGES.CONTENT_CREATED, category);
    } catch (err) {
      return next(err);
    }
  };
}
