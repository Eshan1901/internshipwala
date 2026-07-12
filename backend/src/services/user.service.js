/**
 * User Service
 *
 * All business logic for student profile management.
 * Depends exclusively on IUserRepository — no Prisma, no Express objects.
 *
 * Methods (from Backend-Architecture.md Section 18.2):
 *   getProfile(userId)
 *   updateProfile(userId, dto)
 *   updateProfilePhoto(userId, filePath)
 *
 * Business rules enforced here (from Section 3.2):
 *   - Email and mobile updates must remain unique across the platform
 *   - Students cannot modify is_verified, is_active, or referral_code
 *   - password_hash is never returned in any response
 *   - Profile photo URL stored as relative path: /uploads/profiles/filename.jpg
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { AppError } from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';
import logger from '../logger/logger.js';
import { storageService } from './storage.service.js';

// Resolve the project root so we can compute relative upload URLs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

export class UserService {
  /**
   * @param {import('../repositories/interfaces/IUserRepository.js').IUserRepository} userRepo
   */
  constructor(userRepo) {
    this.userRepo = userRepo;
  }

  // ── Get profile ────────────────────────────────────────────────────────────

  /**
   * Retrieve the authenticated student's profile.
   * password_hash is stripped before returning.
   *
   * @param {string} userId - UUID from req.user.id
   * @returns {Promise<object>} Safe user object
   */
  async getProfile(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError(404, MESSAGES.NOT_FOUND);

    return this._stripSensitiveFields(user);
  }

  // ── Update profile ─────────────────────────────────────────────────────────

  /**
   * Update the authenticated student's profile fields.
   *
   * Students may NOT modify: is_verified, is_active, referral_code, password_hash.
   * Those fields are stripped from the DTO before the update is applied.
   *
   * Email and mobile updates are checked for platform-wide uniqueness.
   *
   * @param {string} userId
   * @param {object} dto - Validated update payload from req.body
   * @returns {Promise<object>} Updated safe user object
   */
  async updateProfile(userId, dto) {
    // Strip fields students are not permitted to change — defensive guard
    // even though the validator schema never includes them.
    // eslint-disable-next-line no-unused-vars
    const { is_verified: _v, is_active: _a, referral_code: _r, password_hash: _p, ...safeDto } = dto;

    // Uniqueness check for email change
    if (safeDto.email) {
      const existing = await this.userRepo.findByEmail(safeDto.email);
      if (existing && existing.id !== userId) {
        throw new AppError(409, 'An account with this email address already exists.');
      }
    }

    // Uniqueness check for mobile change
    if (safeDto.mobile) {
      const existing = await this.userRepo.findByMobile(safeDto.mobile);
      if (existing && existing.id !== userId) {
        throw new AppError(409, 'An account with this mobile number already exists.');
      }
    }

    const updated = await this.userRepo.update(userId, safeDto);

    logger.info('Student profile updated', { userId });

    return this._stripSensitiveFields(updated);
  }

  // ── Update profile photo ───────────────────────────────────────────────────

  /**
   * Persist the uploaded profile photo URL on the user record.
   *
   * @param {string} userId
   * @param {Express.Multer.File} file - Multer uploaded file
   * @returns {Promise<{ profile_photo_url: string }>}
   */
  async updateProfilePhoto(userId, file) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError(404, MESSAGES.NOT_FOUND);

    const oldPhotoUrl = user.profile_photo_url;

    // Upload new photo to configured storage provider
    const newPhotoUrl = await storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      'profiles'
    );

    try {
      await this.userRepo.update(userId, { profile_photo_url: newPhotoUrl });

      // Clean up the old photo from storage if it exists
      if (oldPhotoUrl) {
        await storageService.deleteFile(oldPhotoUrl);
      }

      logger.info('Profile photo updated', { userId });
      return { profile_photo_url: newPhotoUrl };
    } catch (err) {
      // Clean up the new photo in case DB update fails
      await storageService.deleteFile(newPhotoUrl);
      throw err;
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Remove password_hash from any user object before returning to the controller.
   * This is a defence-in-depth measure — the repository should already exclude it,
   * but we never rely on that assumption at the service layer.
   *
   * @param {object} user
   * @returns {object} User without password_hash
   * @private
   */
  _stripSensitiveFields(user) {
    const { password_hash: _ph, ...safe } = user; // eslint-disable-line no-unused-vars
    return safe;
  }
}
