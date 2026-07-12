/**
 * User Controller
 *
 * HTTP boundary for student profile management.
 * No business logic. No direct data access.
 * Responsibilities: parse request → call UserService → return response.
 *
 * Endpoints (from Backend-Architecture.md Section 4.2):
 *   GET  /api/user/profile
 *   PUT  /api/user/profile
 *   POST /api/user/profile/photo
 */


import { sendSuccess } from '../utils/response.js';
import { MESSAGES } from '../constants/messages.js';
import logger from '../logger/logger.js';

export class UserController {
  /**
   * @param {import('../services/user.service.js').UserService} userService
   */
  constructor(userService) {
    this.userService = userService;
  }

  /**
   * GET /api/user/profile
   * Returns the authenticated student's profile.
   */
  getProfile = async (req, res, next) => {
    try {
      const user = await this.userService.getProfile(req.user.id);
      return sendSuccess(res, 200, MESSAGES.PROFILE_FETCHED, user);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * PUT /api/user/profile
   * Updates mutable profile fields.
   */
  updateProfile = async (req, res, next) => {
    try {
      const user = await this.userService.updateProfile(req.user.id, req.body);
      return sendSuccess(res, 200, MESSAGES.PROFILE_UPDATED, user);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * POST /api/user/profile/photo
   * Uploads and sets a new profile photo.
   *
   * Multer places the saved file info on req.file.
   * If the service throws after upload, we delete the orphaned file.
   * (From Backend-Architecture.md Section 18.2 pitfall notes.)
   */
  uploadPhoto = async (req, res, next) => {
    // Multer already ran — if no file present, it means the field was missing
    if (!req.file) {
      return next(
        Object.assign(new Error('Profile photo file is required.'), {
          statusCode: 400,
          isOperational: true,
          errors: [],
        })
      );
    }

    try {
      const result = await this.userService.updateProfilePhoto(req.user.id, req.file);
      return sendSuccess(res, 200, MESSAGES.PHOTO_UPLOADED, result);
    } catch (err) {
      return next(err);
    }
  };
}
