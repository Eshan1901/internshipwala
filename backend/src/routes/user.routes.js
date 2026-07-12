/**
 * User Profile Routes
 *
 * All routes require student JWT authentication.
 * Dependency injection: IUserRepository → UserService → UserController.
 *
 * When the database developer delivers UserRepository (Prisma implementation),
 * replace `IUserRepository` with `UserRepository` — nothing else changes.
 *
 * Routes (from Backend-Architecture.md Section 4.2):
 *   GET  /api/user/profile         — get own profile
 *   PUT  /api/user/profile         — update profile fields
 *   POST /api/user/profile/photo   — upload profile photo
 */

import { Router } from 'express';

import { IUserRepository } from '../repositories/interfaces/IUserRepository.js';
import { UserService } from '../services/user.service.js';
import { UserController } from '../controllers/user.controller.js';
import authenticate from '../middlewares/authenticate.js';
import { uploadProfilePhoto } from '../middlewares/uploadMiddleware.js';
import { validate } from '../middlewares/validate.js';
import asyncHandler from '../utils/asyncHandler.js';
import { updateProfileSchema } from '../validators/user.validator.js';

// ── Dependency injection ──────────────────────────────────────────────────────
const userRepo = new IUserRepository();
const userService = new UserService(userRepo);
const userController = new UserController(userService);

// The authenticate middleware also needs the userRepo to verify the JWT subject
const authMiddleware = authenticate(userRepo);

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

// All user routes require a valid student JWT
router.use(authMiddleware);

// GET /api/user/profile
router.get(
  '/profile',
  asyncHandler(userController.getProfile)
);

// PUT /api/user/profile
router.put(
  '/profile',
  validate(updateProfileSchema),
  asyncHandler(userController.updateProfile)
);

// POST /api/user/profile/photo
// uploadProfilePhoto runs Multer before the controller.
// Multer validates MIME type, extension, and file size.
router.post(
  '/profile/photo',
  uploadProfilePhoto,
  asyncHandler(userController.uploadPhoto)
);

export default router;
