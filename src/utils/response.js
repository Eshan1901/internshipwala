/**
 * HTTP Response Helpers
 *
 * All controllers must use these helpers to send responses.
 * This enforces a consistent response shape across every endpoint.
 *
 * Success shape:
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": { ... }           // present when data is provided
 *   "meta": { ... }           // present for paginated responses
 * }
 *
 * Error shape:
 * {
 *   "success": false,
 *   "message": "...",
 *   "errors": [ ... ]         // present for validation errors
 * }
 */

/**
 * Send a successful response.
 *
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code (200, 201, etc.)
 * @param {string} message - Human-readable success message
 * @param {*} [data] - Response payload (object, array, or primitive)
 * @param {object} [meta] - Pagination metadata (total, page, limit, totalPages)
 */
export const sendSuccess = (res, statusCode, message, data, meta) => {
  const body = { success: true, message };

  if (data !== undefined) {
    body.data = data;
  }

  if (meta !== undefined) {
    body.meta = meta;
  }

  return res.status(statusCode).json(body);
};

/**
 * Send an error response.
 * Called by the global error handler — controllers should call next(error) instead.
 *
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 409, 500, etc.)
 * @param {string} message - Human-readable error message
 * @param {Array<{field: string, message: string}>} [errors] - Field-level validation errors
 */
export const sendError = (res, statusCode, message, errors = []) => {
  const body = { success: false, message };

  if (errors.length > 0) {
    body.errors = errors;
  }

  return res.status(statusCode).json(body);
};
