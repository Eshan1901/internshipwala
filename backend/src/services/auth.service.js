/**
 * Authentication Service
 *
 * Contains all business logic for student and admin authentication.
 * Depends on repository interfaces — never on Prisma or any concrete
 * database implementation.
 *
 * Methods (from Backend-Architecture.md Section 5.1):
 *   register, verifyOtp, resendOtp, login, adminLogin,
 *   forgotPassword, resetPassword, changePassword
 *
 * Business rules enforced here:
 *   - One account per email and per mobile number
 *   - Passwords stored as bcrypt hash (cost 12)
 *   - Unverified accounts cannot log in
 *   - Deactivated accounts cannot log in
 *   - OTP expires in OTP_EXPIRY_MINUTES minutes
 *   - Admin login uses a separate JWT secret
 *   - forgotPassword always returns 200 (prevents user enumeration)
 *   - Login error messages are intentionally vague (no email-vs-password hint)
 */

import { AppError } from '../utils/AppError.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateOtp, getOtpExpiry } from '../utils/otp.js';
import { signStudentToken, signAdminToken } from '../config/jwt.js';
import { sendOtp, sendWelcome } from './mail.service.js';
import { MESSAGES } from '../constants/messages.js';
import { env } from '../config/env.js';
import logger from '../logger/logger.js';

export class AuthService {
  /**
   * @param {import('../repositories/interfaces/IUserRepository.js').IUserRepository} userRepo
   * @param {import('../repositories/interfaces/IOtpRepository.js').IOtpRepository} otpRepo
   * @param {import('../repositories/interfaces/IAdminRepository.js').IAdminRepository} adminRepo
   */
  constructor(userRepo, otpRepo, adminRepo) {
    this.userRepo = userRepo;
    this.otpRepo = otpRepo;
    this.adminRepo = adminRepo;
  }

  // ── Student Registration ────────────────────────────────────────────────────

  /**
   * Register a new student account.
   * Creates user with is_verified=FALSE, generates OTP, sends OTP email.
   *
   * @param {{ full_name: string, email: string, mobile: string, password: string,
   *            college_name: string, present_course: string, year_qualifying: string,
   *            state: string, referral_code?: string }} dto
   * @returns {Promise<{ userId: string }>}
   */
  async register(dto) {
    // Check uniqueness — one account per email
    const existingByEmail = await this.userRepo.findByEmail(dto.email);
    if (existingByEmail) {
      throw new AppError(409, 'An account with this email address already exists.');
    }

    // Check uniqueness — one account per mobile
    const existingByMobile = await this.userRepo.findByMobile(dto.mobile);
    if (existingByMobile) {
      throw new AppError(409, 'An account with this mobile number already exists.');
    }

    // Hash password before storing — never store plaintext
    const password_hash = await hashPassword(dto.password);

    const user = await this.userRepo.create({
      full_name: dto.full_name,
      email: dto.email,
      mobile: dto.mobile,
      password_hash,
      college_name: dto.college_name,
      present_course: dto.present_course,
      year_qualifying: dto.year_qualifying,
      state: dto.state,
      referral_code: dto.referral_code,
    });

    // Generate and store OTP
    await this._issueOtp(dto.email, 'registration');

    logger.info('User registered', { userId: user.id });

    return { userId: user.id };
  }

  // ── OTP Verification ───────────────────────────────────────────────────────

  /**
   * Verify an OTP and activate the student account (for registration)
   * or mark the OTP as consumed (for password reset).
   *
   * @param {{ email: string, otp_code: string, purpose: 'registration'|'password_reset' }} dto
   * @returns {Promise<void>}
   */
  async verifyOtp(dto) {
    const record = await this.otpRepo.findValid(dto.email, dto.purpose, dto.otp_code);
    if (!record) {
      throw new AppError(401, MESSAGES.INVALID_OTP);
    }

    // Mark OTP as used
    await this.otpRepo.markUsed(record.id);

    // For registration: activate the account
    if (dto.purpose === 'registration') {
      const user = await this.userRepo.findByEmail(dto.email);
      if (!user) throw new AppError(404, MESSAGES.NOT_FOUND);

      await this.userRepo.update(user.id, { is_verified: true });

      // Send welcome email — fire and forget
      sendWelcome(dto.email, user.full_name);

      logger.info('User email verified', { userId: user.id });
    }
  }

  // ── Resend OTP ─────────────────────────────────────────────────────────────

  /**
   * Invalidate any existing OTPs for this target+purpose and issue a new one.
   *
   * @param {string} email
   * @param {'registration'|'password_reset'} purpose
   * @returns {Promise<void>}
   */
  async resendOtp(email, purpose) {
    // Confirm the email exists (don't reveal if it doesn't — just silently proceed)
    // For registration resend: account must exist
    if (purpose === 'registration') {
      const user = await this.userRepo.findByEmail(email);
      if (!user) throw new AppError(404, MESSAGES.NOT_FOUND);
      if (user.is_verified) {
        throw new AppError(400, 'This account is already verified.');
      }
    }

    await this._issueOtp(email, purpose);
  }

  // ── Student Login ──────────────────────────────────────────────────────────

  /**
   * Authenticate a student and return a signed JWT.
   *
   * @param {{ email: string, password: string }} dto
   * @returns {Promise<{ token: string, user: object }>}
   */
  async login(dto) {
    const user = await this.userRepo.findByEmail(dto.email);

    // Use identical error for wrong email and wrong password — prevent enumeration
    if (!user) {
      throw new AppError(401, MESSAGES.INVALID_CREDENTIALS);
    }

    const passwordMatch = await comparePassword(dto.password, user.password_hash);
    if (!passwordMatch) {
      throw new AppError(401, MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.is_verified) {
      throw new AppError(403, MESSAGES.EMAIL_NOT_VERIFIED);
    }

    if (!user.is_active) {
      throw new AppError(403, MESSAGES.ACCOUNT_DEACTIVATED);
    }

    await this.userRepo.updateLastLogin(user.id);

    const token = signStudentToken({ id: user.id, email: user.email });

    // Strip password_hash before returning to controller
    const { password_hash: _pw, ...safeUser } = user; // eslint-disable-line no-unused-vars

    logger.info('Student logged in', { userId: user.id });

    return { token, user: safeUser };
  }

  // ── Admin Login ────────────────────────────────────────────────────────────

  /**
   * Authenticate an admin and return a signed admin JWT with roles and permissions.
   *
   * @param {{ email: string, password: string }} dto
   * @returns {Promise<{ token: string, admin: object }>}
   */
  async adminLogin(dto) {
    const admin = await this.adminRepo.findByEmail(dto.email);

    if (!admin) {
      throw new AppError(401, MESSAGES.INVALID_CREDENTIALS);
    }

    const passwordMatch = await comparePassword(dto.password, admin.password_hash);
    if (!passwordMatch) {
      throw new AppError(401, MESSAGES.INVALID_CREDENTIALS);
    }

    if (!admin.is_active) {
      throw new AppError(403, MESSAGES.ACCOUNT_DEACTIVATED);
    }

    await this.adminRepo.updateLastLogin(admin.id);

    const token = signAdminToken({
      id: admin.id,
      email: admin.email,
      roles: admin.roles || [],
      permissions: admin.permissions || [],
    });

    const { password_hash: _pw, ...safeAdmin } = admin; // eslint-disable-line no-unused-vars

    logger.info('Admin logged in', { adminId: admin.id });

    return { token, admin: safeAdmin };
  }

  // ── Forgot Password ────────────────────────────────────────────────────────

  /**
   * Initiate a password reset by generating and emailing an OTP.
   * Always returns successfully — never reveals whether the email exists
   * (prevents user enumeration).
   *
   * @param {string} email
   * @returns {Promise<void>}
   */
  async forgotPassword(email) {
    const user = await this.userRepo.findByEmail(email);

    // Silently return if user not found — do not leak account existence
    if (!user) {
      logger.info('Forgot password requested for unknown email (silently ignored)');
      return;
    }

    await this._issueOtp(email, 'password_reset');
  }

  // ── Reset Password ─────────────────────────────────────────────────────────

  /**
   * Verify a password-reset OTP and set the new password.
   *
   * @param {{ email: string, otp_code: string, new_password: string }} dto
   * @returns {Promise<void>}
   */
  async resetPassword(dto) {
    const record = await this.otpRepo.findValid(dto.email, 'password_reset', dto.otp_code);
    if (!record) {
      throw new AppError(401, MESSAGES.INVALID_OTP);
    }

    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    const password_hash = await hashPassword(dto.new_password);

    // Mark OTP used and update password — both must succeed together.
    // The repository implementation is responsible for atomicity.
    await this.otpRepo.markUsed(record.id);
    await this.userRepo.update(user.id, { password_hash });

    logger.info('Password reset completed', { userId: user.id });
  }

  // ── Change Password ────────────────────────────────────────────────────────

  /**
   * Change password for an authenticated student.
   * Requires the current password to be correct before accepting the new one.
   *
   * @param {string} userId - UUID of the authenticated student
   * @param {{ current_password: string, new_password: string }} dto
   * @returns {Promise<void>}
   */
  async changePassword(userId, dto) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    const passwordMatch = await comparePassword(dto.current_password, user.password_hash);
    if (!passwordMatch) {
      throw new AppError(401, 'Current password is incorrect.');
    }

    const password_hash = await hashPassword(dto.new_password);
    await this.userRepo.update(userId, { password_hash });

    logger.info('Password changed', { userId });
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Invalidate old OTPs for a target+purpose, generate a new one, store it,
   * and send it via email. Shared by register, resendOtp, and forgotPassword.
   *
   * @param {string} email
   * @param {'registration'|'password_reset'} purpose
   * @returns {Promise<void>}
   * @private
   */
  async _issueOtp(email, purpose) {
    await this.otpRepo.invalidateOld(email, purpose);

    const otp = generateOtp();
    const expires_at = getOtpExpiry(env.OTP_EXPIRY_MINUTES);

    await this.otpRepo.create({
      target: email,
      otp_code: otp,
      purpose,
      expires_at,
    });

    // Fire and forget — never log the OTP value
    sendOtp(email, otp, purpose);
  }
}
