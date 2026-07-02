/**
 * Authentication Routes
 *
 * Wires together: repository interfaces → service → controller → routes.
 * This is the dependency injection point for the auth module.
 *
 * When the database developer delivers concrete repository implementations,
 * replace the IUserRepository / IOtpRepository / IAdminRepository imports
 * with their concrete classes. The service and controller require no changes.
 *
 * Rate limiters applied per spec (Backend-Architecture.md Section 7.5):
 *   authLimiter — all auth routes (20 req / 15 min)
 *   otpLimiter  — resend-otp and verify-otp specifically (5 req / 15 min)
 */

import { Router } from 'express';

import { IUserRepository } from '../repositories/interfaces/IUserRepository.js';
import { IOtpRepository } from '../repositories/interfaces/IOtpRepository.js';
import { IAdminRepository } from '../repositories/interfaces/IAdminRepository.js';

import { AuthService } from '../services/auth.service.js';
import { AuthController } from '../controllers/auth.controller.js';
import authenticate from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { authLimiter, otpLimiter } from '../middlewares/rateLimiter.js';
import asyncHandler from '../utils/asyncHandler.js';

import {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  adminLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/auth.validator.js';

// ── Dependency injection ──────────────────────────────────────────────────────
// Concrete repository implementations will be swapped in here when delivered.
const userRepo = new IUserRepository();
const otpRepo = new IOtpRepository();
const adminRepo = new IAdminRepository();

const authService = new AuthService(userRepo, otpRepo, adminRepo);
const authController = new AuthController(authService);

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

// Apply auth rate limiter to all routes in this router
router.use(authLimiter);

// POST /api/auth/register
router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(authController.register)
);

// POST /api/auth/verify-otp
router.post(
  '/verify-otp',
  otpLimiter,
  validate(verifyOtpSchema),
  asyncHandler(authController.verifyOtp)
);

// POST /api/auth/resend-otp
router.post(
  '/resend-otp',
  otpLimiter,
  validate(resendOtpSchema),
  asyncHandler(authController.resendOtp)
);

// POST /api/auth/login
router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(authController.login)
);

// POST /api/auth/admin/login
router.post(
  '/admin/login',
  validate(adminLoginSchema),
  asyncHandler(authController.adminLogin)
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword)
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(authController.resetPassword)
);

// PUT /api/auth/change-password  — requires student JWT
router.put(
  '/change-password',
  authenticate(userRepo),
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword)
);

export default router;
