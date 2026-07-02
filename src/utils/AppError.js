/**
 * AppError — Custom Application Error Class
 *
 * All expected, handled error conditions in the application should
 * throw an AppError instead of a plain Error. The global error handler
 * checks `isOperational` to decide whether to expose the message to
 * the client or return a generic 500 response.
 *
 * Usage:
 *   throw new AppError(404, 'User not found');
 *   throw new AppError(400, 'Validation failed', [{ field: 'email', message: 'Invalid email' }]);
 */

export class AppError extends Error {
  /**
   * @param {number} statusCode - HTTP status code to return to the client
   * @param {string} message - Human-readable error message safe to expose to clients
   * @param {Array<{field: string, message: string}>} [errors] - Optional field-level validation errors
   */
  constructor(statusCode, message, errors = []) {
    super(message);

    /** @type {number} */
    this.statusCode = statusCode;

    /** @type {Array<{field: string, message: string}>} */
    this.errors = errors;

    /**
     * Operational errors are expected failures (validation, not found, auth failure).
     * Their messages are safe to return to the client.
     * Non-operational errors (programming bugs, unexpected failures) get a generic 500 response.
     * @type {boolean}
     */
    this.isOperational = true;

    // Capture a clean stack trace that excludes this constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}
