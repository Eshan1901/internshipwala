/**
 * Authentication Controller
 *
 * HTTP boundary for all authentication operations.
 * Responsibilities: parse request, call AuthService, return response.
 * No business logic. No database access. No direct Prisma calls.
 *
 * Endpoints (from Backend-Architecture.md Section 4.1):
 *   POST   /api/auth/register
 *   POST   /api/auth/verify-otp
 *   POST   /api/auth/resend-otp
 *   POST   /api/auth/login
 *   POST   /api/auth/admin/login
 *   POST   /api/auth/forgot-password
 *   POST   /api/auth/reset-password
 *   PUT    /api/auth/change-password  (requires student JWT)
 */

import { sendSuccess } from '../utils/response.js';
import { MESSAGES } from '../constants/messages.js';

export class AuthController {
  /**
   * @param {import('../services/auth.service.js').AuthService} authService
   */
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * POST /api/auth/register
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  register = async (req, res, next) => {
    try {
      const result = await this.authService.register(req.body);
      return sendSuccess(res, 201, MESSAGES.REGISTER_SUCCESS, result);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * POST /api/auth/verify-otp
   */
  verifyOtp = async (req, res, next) => {
    try {
      await this.authService.verifyOtp(req.body);
      return sendSuccess(res, 200, MESSAGES.OTP_VERIFIED);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * POST /api/auth/resend-otp
   */
  resendOtp = async (req, res, next) => {
    try {
      await this.authService.resendOtp(req.body.email, req.body.purpose);
      return sendSuccess(res, 200, MESSAGES.OTP_RESENT);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * POST /api/auth/login
   */
  login = async (req, res, next) => {
    try {
      const result = await this.authService.login(req.body);
      return sendSuccess(res, 200, MESSAGES.LOGIN_SUCCESS, result);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * POST /api/auth/admin/login
   */
  adminLogin = async (req, res, next) => {
    try {
      const result = await this.authService.adminLogin(req.body);
      return sendSuccess(res, 200, MESSAGES.LOGIN_SUCCESS, result);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * POST /api/auth/forgot-password
   * Always returns 200 regardless of whether the email exists.
   */
  forgotPassword = async (req, res, next) => {
    try {
      await this.authService.forgotPassword(req.body.email);
      return sendSuccess(res, 200, MESSAGES.PASSWORD_RESET_INITIATED);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * POST /api/auth/reset-password
   */
  resetPassword = async (req, res, next) => {
    try {
      await this.authService.resetPassword(req.body);
      return sendSuccess(res, 200, MESSAGES.PASSWORD_RESET_SUCCESS);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * PUT /api/auth/change-password
   * Requires authenticate middleware — req.user.id is set.
   */
  changePassword = async (req, res, next) => {
    try {
      await this.authService.changePassword(req.user.id, req.body);
      return sendSuccess(res, 200, MESSAGES.PASSWORD_CHANGED);
    } catch (err) {
      return next(err);
    }
  };
}
