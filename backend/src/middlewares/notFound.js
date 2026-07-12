/**
 * 404 Not Found Handler
 *
 * Mounted after all routes. Any request that reaches this middleware
 * did not match any registered route. Creates an AppError and forwards
 * it to the global error handler.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */

import { AppError } from '../utils/AppError.js';

const notFound = (req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export default notFound;
