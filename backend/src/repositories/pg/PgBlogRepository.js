/**
 * PgBlogRepository — PostgreSQL Implementation
 *
 * Implements IBlogRepository using the pg connection pool.
 * Soft-delete: blog_posts uses deleted_at column.
 */

import { IBlogRepository } from '../interfaces/IBlogRepository.js';
import { query } from '../../config/database.js';

export class PgBlogRepository extends IBlogRepository {
  async listPublished(filters, pagination) {
    const conditions = ["bp.status = 'published'", 'bp.deleted_at IS NULL'];
    const values = [];
    let idx = 1;

    if (filters?.category_id) {
      conditions.push(`bp.category_id = $${idx}`);
      values.push(filters.category_id);
      idx++;
    }

    const skip = pagination?.skip ?? 0;
    const take = pagination?.take ?? 10;
    values.push(take, skip);

    const { rows } = await query(
      `SELECT bp.*,
              json_build_object('id', bc.id, 'name', bc.name, 'slug', bc.slug) AS category
       FROM blog_posts bp
       LEFT JOIN blog_categories bc ON bc.id = bp.category_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY bp.published_at DESC NULLS LAST, bp.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );
    return rows;
  }

  async countPublished(filters) {
    const conditions = ["status = 'published'", 'deleted_at IS NULL'];
    const values = [];
    let idx = 1;

    if (filters?.category_id) {
      conditions.push(`category_id = $${idx}`);
      values.push(filters.category_id);
      idx++;
    }

    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM blog_posts WHERE ${conditions.join(' AND ')}`,
      values
    );
    return rows[0].total;
  }

  async findBySlug(slug) {
    const { rows } = await query(
      `SELECT bp.*,
              json_build_object('id', bc.id, 'name', bc.name, 'slug', bc.slug) AS category
       FROM blog_posts bp
       LEFT JOIN blog_categories bc ON bc.id = bp.category_id
       WHERE bp.slug = $1 AND bp.status = 'published' AND bp.deleted_at IS NULL`,
      [slug]
    );
    return rows[0] || null;
  }

  async findBySlugAdmin(slug) {
    const { rows } = await query(
      `SELECT * FROM blog_posts WHERE slug = $1`,
      [slug]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const { rows } = await query(
      `SELECT bp.*,
              json_build_object('id', bc.id, 'name', bc.name, 'slug', bc.slug) AS category
       FROM blog_posts bp
       LEFT JOIN blog_categories bc ON bc.id = bp.category_id
       WHERE bp.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async listActiveCategories() {
    const { rows } = await query(
      `SELECT * FROM blog_categories WHERE is_active = TRUE ORDER BY name ASC`
    );
    return rows;
  }

  async findCategoryBySlug(slug) {
    const { rows } = await query(
      `SELECT * FROM blog_categories WHERE slug = $1`,
      [slug]
    );
    return rows[0] || null;
  }

  async createPost(data) {
    const { rows } = await query(
      `INSERT INTO blog_posts (category_id, author_id, title, slug, content, status, thumbnail_url, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [data.category_id, data.author_id, data.title, data.slug,
       data.content, data.status, data.thumbnail_url || null,
       data.published_at || null]
    );
    return rows[0];
  }

  async updatePost(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await query(
      `UPDATE blog_posts SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0] || null;
  }

  async softDeletePost(id) {
    await query(
      `UPDATE blog_posts SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
  }

  async createCategory(data) {
    const { rows } = await query(
      `INSERT INTO blog_categories (name, slug)
       VALUES ($1, $2)
       RETURNING *`,
      [data.name, data.slug]
    );
    return rows[0];
  }

  async listAdmin(filters, pagination) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters?.status) {
      conditions.push(`bp.status = $${idx}`);
      values.push(filters.status);
      idx++;
    }
    if (filters?.category_id) {
      conditions.push(`bp.category_id = $${idx}`);
      values.push(filters.category_id);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const skip = pagination?.skip ?? 0;
    const take = pagination?.take ?? 10;
    values.push(take, skip);

    const { rows } = await query(
      `SELECT bp.*,
              json_build_object('id', bc.id, 'name', bc.name, 'slug', bc.slug) AS category
       FROM blog_posts bp
       LEFT JOIN blog_categories bc ON bc.id = bp.category_id
       ${where}
       ORDER BY bp.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );
    return rows;
  }

  async countAdmin(filters) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters?.status) {
      conditions.push(`status = $${idx}`);
      values.push(filters.status);
      idx++;
    }
    if (filters?.category_id) {
      conditions.push(`category_id = $${idx}`);
      values.push(filters.category_id);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM blog_posts ${where}`,
      values
    );
    return rows[0].total;
  }
}
