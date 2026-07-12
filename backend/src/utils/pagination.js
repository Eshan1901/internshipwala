/**
 * Pagination Utilities
 *
 * Helpers for parsing pagination query parameters from incoming requests
 * and building the pagination metadata returned in paginated responses.
 *
 * Paginated response meta shape:
 * {
 *   "total": 100,
 *   "page": 2,
 *   "limit": 10,
 *   "totalPages": 10
 * }
 */

/** Default values */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Parse `page` and `limit` from Express request query parameters.
 * Returns sanitized, bounded values with skip/take for database queries.
 *
 * @param {object} query - Express req.query object
 * @param {string|number} [query.page] - Page number (1-based)
 * @param {string|number} [query.limit] - Items per page
 * @returns {{ page: number, limit: number, skip: number, take: number }}
 */
export const parsePaginationQuery = (query = {}) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  // Clamp to valid ranges
  if (!Number.isFinite(page) || page < 1) page = DEFAULT_PAGE;
  if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const skip = (page - 1) * limit;
  const take = limit;

  return { page, limit, skip, take };
};

/**
 * Build the pagination metadata object for API responses.
 *
 * @param {number} total - Total number of records matching the query
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {{ total: number, page: number, limit: number, totalPages: number }}
 */
export const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});
