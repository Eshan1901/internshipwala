/**
 * IBlogRepository — Blog Repository Interface (Contract)
 *
 * Defines every data-access method the application layer requires for
 * the `blog_posts` and `blog_categories` tables.
 * The database developer implements this contract using Prisma.
 *
 * Tables:
 *   blog_posts       (Database-Design.md §5.26) — soft-deleted, UNIQUE (slug)
 *   blog_categories  (Database-Design.md §5.25) — UNIQUE (slug)
 *
 * Soft-delete rule: blog_posts has a deleted_at column. All public queries
 * must filter deleted_at IS NULL. Admin queries may see all posts.
 */

export class IBlogRepository {
  /**
   * List published, non-deleted posts with optional category filter.
   * @param {{ category_id?: string }} filters
   * @param {{ skip: number, take: number }} pagination
   * @returns {Promise<object[]>} Posts with category data
   */
  // eslint-disable-next-line no-unused-vars
  async listPublished(filters, pagination) { throw new Error('IBlogRepository.listPublished not implemented'); }

  /**
   * Count published, non-deleted posts with optional category filter.
   * @param {{ category_id?: string }} filters
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line no-unused-vars
  async countPublished(filters) { throw new Error('IBlogRepository.countPublished not implemented'); }

  /**
   * Find a single published, non-deleted post by slug.
   * Used by the public detail endpoint.
   * @param {string} slug
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findBySlug(slug) { throw new Error('IBlogRepository.findBySlug not implemented'); }

  /**
   * Find a post by slug regardless of status or deleted_at.
   * Used by the service for application-layer uniqueness checks before create/update.
   * @param {string} slug
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findBySlugAdmin(slug) { throw new Error('IBlogRepository.findBySlugAdmin not implemented'); }

  /**
   * Find a post by primary key regardless of status or deleted_at.
   * Used by admin endpoints.
   * @param {string} id - UUID
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findById(id) { throw new Error('IBlogRepository.findById not implemented'); }

  /**
   * List all active blog categories.
   * @returns {Promise<object[]>}
   */
  async listActiveCategories() { throw new Error('IBlogRepository.listActiveCategories not implemented'); }

  /**
   * Find a category by its slug.
   * Used for uniqueness check before creating a category.
   * @param {string} slug
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findCategoryBySlug(slug) { throw new Error('IBlogRepository.findCategoryBySlug not implemented'); }

  /**
   * Insert a new blog post.
   * @param {{ category_id: string, author_id: string, title: string, slug: string,
   *           content: string, status: string, thumbnail_url?: string,
   *           published_at?: Date }} data
   * @returns {Promise<object>} Created post
   */
  // eslint-disable-next-line no-unused-vars
  async createPost(data) { throw new Error('IBlogRepository.createPost not implemented'); }

  /**
   * Update mutable fields on a blog post.
   * @param {string} id - UUID
   * @param {Partial<object>} data
   * @returns {Promise<object>} Updated post
   */
  // eslint-disable-next-line no-unused-vars
  async updatePost(id, data) { throw new Error('IBlogRepository.updatePost not implemented'); }

  /**
   * Soft-delete a blog post by setting deleted_at = NOW().
   * @param {string} id - UUID
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async softDeletePost(id) { throw new Error('IBlogRepository.softDeletePost not implemented'); }

  /**
   * Insert a new blog category.
   * @param {{ name: string, slug: string }} data
   * @returns {Promise<object>} Created category
   */
  // eslint-disable-next-line no-unused-vars
  async createCategory(data) { throw new Error('IBlogRepository.createCategory not implemented'); }

  /**
   * List all posts for admin view (no status/deleted_at filter).
   * @param {{ status?: string, category_id?: string }} filters
   * @param {{ skip: number, take: number }} pagination
   * @returns {Promise<object[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async listAdmin(filters, pagination) { throw new Error('IBlogRepository.listAdmin not implemented'); }

  /**
   * Count all posts for admin view.
   * @param {{ status?: string, category_id?: string }} filters
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line no-unused-vars
  async countAdmin(filters) { throw new Error('IBlogRepository.countAdmin not implemented'); }
}
