/**
 * Student Authentication Middleware
 *
 * Verifies the Bearer JWT on protected student routes.
 * On success: attaches the user record to req.user and calls next().
 * On failure: forwards an AppError to the global error handler.
 *
 * Algorithm (from Backend-Architecture.md Section 7.1):
 *   1. Extract Bearer token from Authorization header
 *   2. If missing → 401
 *   3. Verify JWT with STUDENT_JWT_SECRET
 *   4. If invalid/expired → 401
 *   5. Find user by id in payload; check deleted_at IS NULL AND is_active AND is_verified
 *   6. If not found or inactive → 401
 *   7. Attach user to req.user; call next()
 *
 * The user object attached to req.user never contains password_hash.
 */

import { verifyStudentToken } from '../config/jwt.js';
import { AppError } from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';

/**
 * Factory — takes the user repository interface and returns the middleware.
 * This allows the middleware to be wired with a concrete repo in the route file.
 *
 * @param {import('../repositories/interfaces/IUserRepository.js').IUserRepository} userRepo
 * @returns {import('express').RequestHandler}
 */
const authenticate = (userRepo) => async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError(401, MESSAGES.UNAUTHORIZED));
    }

    const token = authHeader.split(' ')[1];

    // Throws JsonWebTokenError or TokenExpiredError on invalid token —
    // both are mapped to 401 by the global error handler.
    const payload = verifyStudentToken(token);

    const user = await userRepo.findById(payload.id);

    if (!user || !user.is_active || !user.is_verified) {
      return next(new AppError(401, MESSAGES.UNAUTHORIZED));
    }

    // Attach safe user object (password_hash already excluded by repository)
    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
};

export default authenticate;
