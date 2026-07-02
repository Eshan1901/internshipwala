/**
 * Admin Authentication Middleware
 *
 * Verifies the Bearer JWT on protected admin routes.
 * On success: attaches the admin record (with roles and permissions) to
 * req.admin and calls next().
 * On failure: forwards an AppError to the global error handler.
 *
 * Algorithm (from Backend-Architecture.md Section 7.1):
 *   1. Extract Bearer token from Authorization header
 *   2. If missing → 401
 *   3. Verify with ADMIN_JWT_SECRET (separate from student secret)
 *   4. If invalid/expired → 401
 *   5. Find admin_user WHERE id = payload.id AND deleted_at IS NULL AND is_active = TRUE
 *   6. If not found → 401
 *   7. Attach admin (with roles[] and permissions[]) to req.admin; call next()
 *
 * The admin object attached to req.admin never contains password_hash.
 */

import { verifyAdminToken } from '../config/jwt.js';
import { AppError } from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';

/**
 * Factory — takes the admin repository interface and returns the middleware.
 *
 * @param {import('../repositories/interfaces/IAdminRepository.js').IAdminRepository} adminRepo
 * @returns {import('express').RequestHandler}
 */
const authenticateAdmin = (adminRepo) => async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError(401, MESSAGES.UNAUTHORIZED));
    }

    const token = authHeader.split(' ')[1];

    const payload = verifyAdminToken(token);

    const admin = await adminRepo.findById(payload.id);

    if (!admin || !admin.is_active) {
      return next(new AppError(401, MESSAGES.UNAUTHORIZED));
    }

    // Attach safe admin object — roles and permissions are included by the repository
    req.admin = admin;
    return next();
  } catch (err) {
    return next(err);
  }
};

export default authenticateAdmin;
