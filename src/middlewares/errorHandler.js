/**
 * Global Error Handler Middleware
 *
 * Must be the last middleware registered in app.js (four-argument signature).
 * Handles all errors forwarded via next(err) from any layer.
 *
 * Behaviour:
 *  - AppError (isOperational = true)  → use its statusCode and message directly
 *  - Prisma P2002 (unique constraint) → 409 Conflict
 *  - Prisma P2025 (record not found)  → 404 Not Found
 *  - Prisma P2003 (foreign key)       → 400 Bad Request
 *  - Prisma P2016 (query error)       → 400 Bad Request
 *  - JsonWebTokenError                → 401 Unauthorized
 *  - TokenExpiredError                → 401 Unauthorized
 *  - PayloadTooLargeError             → 413 Payload Too Large
 *  - Unexpected errors                → 500 Internal Server Error
 *
 * Production rules (from AI_INSTRUCTIONS.md):
 *  - Never expose stack traces to clients in production.
 *  - Never expose SQL errors or internal implementation details.
 *  - Log all unexpected (non-operational) errors at error level.
 */

import logger from '../logger/logger.js';
import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/response.js';
import { MESSAGES } from '../constants/messages.js';

/**
 * Map a Prisma client error code to an AppError.
 *
 * @param {Error & { code?: string, meta?: object }} err
 * @returns {AppError|null} Mapped error or null if not a handled Prisma error
 */
const mapPrismaError = (err) => {
  if (!err.code) return null;

  switch (err.code) {
    case 'P2002': {
      // Unique constraint violation — extract the field name from meta if available
      const fields = err.meta?.target;
      const fieldMsg = Array.isArray(fields) ? fields.join(', ') : 'field';
      return new AppError(409, `A record with this ${fieldMsg} already exists.`);
    }
    case 'P2025':
      return new AppError(404, MESSAGES.NOT_FOUND);
    case 'P2003':
      return new AppError(400, 'Referenced record does not exist.');
    case 'P2016':
      return new AppError(400, 'Invalid query parameters.');
    default:
      return null;
  }
};

/**
 * Map JWT library errors to an AppError.
 *
 * @param {Error} err
 * @returns {AppError|null}
 */
const mapJwtError = (err) => {
  if (err.name === 'TokenExpiredError') {
    return new AppError(401, MESSAGES.TOKEN_EXPIRED);
  }
  if (err.name === 'JsonWebTokenError') {
    return new AppError(401, MESSAGES.TOKEN_INVALID);
  }
  return null;
};

/**
 * Global Express error handler.
 * Four-argument signature is required for Express to recognise it as an error handler.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // ── Normalise the error into an AppError ───────────────────────────────────

  let error = err;

  // Prisma errors
  const prismaError = mapPrismaError(err);
  if (prismaError) error = prismaError;

  // JWT errors
  const jwtError = mapJwtError(err);
  if (jwtError) error = jwtError;

  // express body-parser payload too large
  if (err.type === 'entity.too.large') {
    error = new AppError(413, 'Request payload is too large.');
  }

  // ── Determine if this is a known operational error ─────────────────────────

  const isOperational = error instanceof AppError && error.isOperational;

  // ── Log strategy ───────────────────────────────────────────────────────────
  // Operational errors (4xx) are logged at warn level — they are expected.
  // Unexpected errors (5xx, programming bugs) are logged at error level with
  // the full stack so they can be investigated.

  if (!isOperational) {
    logger.error('Unhandled error', {
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
  } else if (error.statusCode >= 500) {
    logger.error('Operational 5xx error', {
      message: error.message,
      method: req.method,
      url: req.originalUrl,
    });
  } else {
    logger.warn('Client error', {
      statusCode: error.statusCode,
      message: error.message,
      method: req.method,
      url: req.originalUrl,
    });
  }

  // ── Build response ─────────────────────────────────────────────────────────

  const statusCode = isOperational ? error.statusCode : 500;

  // In production, never expose internal error details for unexpected errors.
  // In development, surface the real message to aid debugging.
  const message = isOperational
    ? error.message
    : process.env.NODE_ENV === 'production'
      ? MESSAGES.INTERNAL_ERROR
      : err.message;

  const errors = isOperational && Array.isArray(error.errors) ? error.errors : [];

  return sendError(res, statusCode, message, errors);
};

export default errorHandler;
