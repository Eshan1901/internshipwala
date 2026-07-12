/**
 * Blog Service
 *
 * All business logic for blog post and category management.
 * Depends exclusively on IBlogRepository — no Prisma, no Express objects.
 *
 * Business rules enforced here (from Backend-Architecture.md §3.8):
 *   - Only published posts appear in public listing
 *   - Slugs must be unique; auto-generated from title if not provided
 *   - published_at is set to NOW() on first publish action only
 *   - Slug is preserved on update unless client explicitly supplies a new one
 *   - Application-layer uniqueness check before insert/update (409 before DB attempt)
 *   - Soft-delete: deleted_at = NOW() — never hard-delete
 */

import { AppError } from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';
import { slugify } from '../utils/slugify.js';
import { parsePaginationQuery, buildPaginationMeta } from '../utils/pagination.js';
import { ContentStatus } from '../constants/enums.js';
import logger from '../logger/logger.js';

export class BlogService {
  /**
   * @param {import('../repositories/interfaces/IBlogRepository.js').IBlogRepository} blogRepo
   */
  constructor(blogRepo) {
    this.blogRepo = blogRepo;
  }

  // ── Public: list published posts ───────────────────────────────────────────

  /**
   * List published, non-deleted posts with optional category filter.
   * From §3.8: "Only published posts appear in public listing"
   *
   * @param {object} rawQuery - req.query (category, page, limit)
   * @returns {Promise<{ posts: object[], meta: object }>}
   */
  async listPublic(rawQuery) {
    const { page, limit, skip, take } = parsePaginationQuery(rawQuery);
    const filters = { category_id: rawQuery.category };

    const [posts, total] = await Promise.all([
      this.blogRepo.listPublished(filters, { skip, take }),
      this.blogRepo.countPublished(filters),
    ]);

    return { posts, meta: buildPaginationMeta(total, page, limit) };
  }

  // ── Public: get post by slug ───────────────────────────────────────────────

  /**
   * Fetch a single published post by its URL slug.
   * @param {string} slug
   * @returns {Promise<object>}
   */
  async getBySlug(slug) {
    const post = await this.blogRepo.findBySlug(slug);
    if (!post) throw new AppError(404, MESSAGES.NOT_FOUND);
    return post;
  }

  // ── Public: list categories ────────────────────────────────────────────────

  /**
   * List all active blog categories.
   * @returns {Promise<object[]>}
   */
  async listCategories() {
    return this.blogRepo.listActiveCategories();
  }

  // ── Admin: list all posts ──────────────────────────────────────────────────

  /**
   * Paginated list of all posts for admin (no status/deleted_at filter).
   * @param {object} rawQuery
   * @returns {Promise<{ posts: object[], meta: object }>}
   */
  async adminList(rawQuery) {
    const { page, limit, skip, take } = parsePaginationQuery(rawQuery);
    const filters = {
      status: rawQuery.status,
      category_id: rawQuery.category,
    };

    const [posts, total] = await Promise.all([
      this.blogRepo.listAdmin(filters, { skip, take }),
      this.blogRepo.countAdmin(filters),
    ]);

    return { posts, meta: buildPaginationMeta(total, page, limit) };
  }

  // ── Admin: create post ─────────────────────────────────────────────────────

  /**
   * Create a new blog post.
   *
   * Slug rules (§3.8, §9.7):
   *   - Auto-generated from title if not provided by client
   *   - Application-layer uniqueness check before insert → 409 if taken
   *   - DB UNIQUE constraint remains final safety net
   *
   * published_at rule (§3.8):
   *   - Set to NOW() if status is 'published' on creation
   *
   * @param {string} adminId
   * @param {object} dto - Validated body from createPostSchema
   * @returns {Promise<object>} Created post
   */
  async adminCreate(adminId, dto) {
    // Determine slug: use provided or auto-generate from title
    const slug = dto.slug ? dto.slug : slugify(dto.title);

    // Application-layer uniqueness check (approved clarification 1)
    const existing = await this.blogRepo.findBySlugAdmin(slug);
    if (existing) {
      throw new AppError(409, `A blog post with the slug "${slug}" already exists.`);
    }

    // Set published_at if creating with status=published
    const publishedAt =
      dto.status === ContentStatus.PUBLISHED ? new Date() : null;

    const post = await this.blogRepo.createPost({
      category_id: dto.category_id,
      author_id: adminId,
      title: dto.title,
      slug,
      content: dto.content,
      status: dto.status,
      thumbnail_url: dto.thumbnail_url,
      published_at: publishedAt,
    });

    logger.info('Blog post created', { postId: post.id, slug, adminId });

    return post;
  }

  // ── Admin: update post ─────────────────────────────────────────────────────

  /**
   * Update a blog post's mutable fields.
   *
   * Slug rules (approved clarification 2 — documentation is silent on
   * auto-regeneration during update):
   *   - If client provides a slug → check uniqueness against other posts → use it
   *   - If client does NOT provide a slug → preserve existing slug unchanged
   *   - Title changes NEVER auto-regenerate the slug
   *
   * published_at rule (§3.8):
   *   - Set to NOW() only on first publish (i.e., existing published_at is null)
   *   - Never overwrite an already-set published_at
   *
   * @param {string} adminId
   * @param {string} id - Post UUID
   * @param {object} dto - Validated body from updatePostSchema
   * @returns {Promise<object>} Updated post
   */
  async adminUpdate(adminId, id, dto) {
    const existing = await this.blogRepo.findById(id);
    if (!existing) throw new AppError(404, MESSAGES.NOT_FOUND);

    const updateData = { ...dto };

    // Slug handling: only process if client explicitly provided one
    if (dto.slug) {
      if (dto.slug !== existing.slug) {
        // Uniqueness check for the new slug
        const slugConflict = await this.blogRepo.findBySlugAdmin(dto.slug);
        if (slugConflict && slugConflict.id !== id) {
          throw new AppError(409, `A blog post with the slug "${dto.slug}" already exists.`);
        }
      }
      // slug is already in updateData — no change needed
    } else {
      // No slug in request → remove from updateData so existing slug is preserved
      delete updateData.slug;
    }

    // published_at: set on first publish only
    if (dto.status === ContentStatus.PUBLISHED && !existing.published_at) {
      updateData.published_at = new Date();
    }

    const updated = await this.blogRepo.updatePost(id, updateData);

    logger.info('Blog post updated', { postId: id, adminId });

    return updated;
  }

  // ── Admin: delete post ─────────────────────────────────────────────────────

  /**
   * Soft-delete a blog post.
   * @param {string} adminId
   * @param {string} id - Post UUID
   * @returns {Promise<void>}
   */
  async adminDelete(adminId, id) {
    const existing = await this.blogRepo.findById(id);
    if (!existing) throw new AppError(404, MESSAGES.NOT_FOUND);

    await this.blogRepo.softDeletePost(id);

    logger.info('Blog post deleted', { postId: id, adminId });
  }

  // ── Admin: create category ─────────────────────────────────────────────────

  /**
   * Create a new blog category.
   * Slug auto-generated from name if not provided; uniqueness checked
   * at application layer before insert.
   *
   * @param {string} adminId
   * @param {{ name: string, slug?: string }} dto
   * @returns {Promise<object>} Created category
   */
  async adminCreateCategory(adminId, dto) {
    const slug = dto.slug ? dto.slug : slugify(dto.name);

    // Application-layer uniqueness check
    const existing = await this.blogRepo.findCategoryBySlug(slug);
    if (existing) {
      throw new AppError(409, `A category with the slug "${slug}" already exists.`);
    }

    const category = await this.blogRepo.createCategory({ name: dto.name, slug });

    logger.info('Blog category created', { categoryId: category.id, slug, adminId });

    return category;
  }
}
