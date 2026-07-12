/**
 * Mail Service
 *
 * Sends transactional emails for all authentication and notification flows.
 * All send methods are fire-and-forget — errors are logged but never thrown
 * to the caller. A mail failure must never break a business operation.
 *
 * Templates (from Backend-Architecture.md Section 5.7):
 *   sendOtp            — registration and password-reset OTP
 *   sendWelcome        — after OTP verification (account activated)
 *   sendPasswordReset  — password reset OTP
 *
 * Rules (from AI_INSTRUCTIONS.md):
 *   Never log OTP values, passwords, or tokens — even at debug level.
 */

import transporter from '../config/mailer.js';
import { env } from '../config/env.js';
import logger from '../logger/logger.js';

/**
 * Send an OTP email.
 * Used for both registration and password-reset flows.
 *
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code (never logged)
 * @param {'registration'|'password_reset'} purpose
 * @returns {Promise<void>}
 */
export const sendOtp = async (email, otp, purpose) => {
  const isReset = purpose === 'password_reset';
  const subject = isReset
    ? 'InternshipWala — Password Reset OTP'
    : 'InternshipWala — Verify Your Email';

  const actionLabel = isReset ? 'reset your password' : 'verify your email address';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a73e8;">InternshipWala</h2>
      <p>Use the OTP below to ${actionLabel}:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px;
                  color: #1a73e8; padding: 16px 0;">${otp}</div>
      <p style="color: #666;">This OTP is valid for <strong>${env.OTP_EXPIRY_MINUTES} minutes</strong>.</p>
      <p style="color: #666;">If you did not request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 12px; color: #999;">
        InternshipWala Careers · career.internshipwala@gmail.com
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: env.MAIL_FROM,
      to: email,
      subject,
      html,
    });
    logger.info('OTP email sent', { to: email, purpose });
  } catch (err) {
    // Mail failures are logged but never propagated — the caller continues
    logger.error('Failed to send OTP email', { to: email, purpose, error: err.message });
  }
};

/**
 * Send a welcome email after successful OTP verification.
 *
 * @param {string} email - Recipient email address
 * @param {string} fullName - Student's full name
 * @returns {Promise<void>}
 */
export const sendWelcome = async (email, fullName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a73e8;">Welcome to InternshipWala, ${fullName}!</h2>
      <p>Your email has been verified. You can now log in and start exploring
         internship and training programs.</p>
      <p>
        <a href="https://www.internshipwala.com" style="color: #1a73e8;">
          Visit InternshipWala
        </a>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 12px; color: #999;">
        InternshipWala Careers · career.internshipwala@gmail.com
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: env.MAIL_FROM,
      to: email,
      subject: 'Welcome to InternshipWala — Account Activated',
      html,
    });
    logger.info('Welcome email sent', { to: email });
  } catch (err) {
    logger.error('Failed to send welcome email', { to: email, error: err.message });
  }
};

/**
 * Send an enrollment confirmation email.
 *
 * @param {string} email - Recipient email address
 * @param {string} courseName - Name of the enrolled course
 * @returns {Promise<void>}
 */
export const sendEnrollmentConfirmation = async (email, courseName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a73e8;">Enrollment Confirmed</h2>
      <p>You have successfully enrolled in <strong>${courseName}</strong>.</p>
      <p>Your enrollment is currently <strong>pending payment confirmation</strong>.
         Once payment is confirmed, you will receive full access to course materials.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 12px; color: #999;">
        InternshipWala Careers · career.internshipwala@gmail.com
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: env.MAIL_FROM,
      to: email,
      subject: `InternshipWala — Enrollment Confirmed: ${courseName}`,
      html,
    });
    logger.info('Enrollment confirmation email sent', { to: email });
  } catch (err) {
    logger.error('Failed to send enrollment confirmation email', { to: email, error: err.message });
  }
};

/**
 * Send a certificate-ready notification email.
 *
 * @param {string} email - Recipient email address
 * @param {string} certNumber - Certificate number (e.g. IW-2026-000123)
 * @returns {Promise<void>}
 */
export const sendCertificateReady = async (email, certNumber) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a73e8;">Your Certificate is Ready</h2>
      <p>Congratulations! Your certificate has been issued.</p>
      <p>Certificate Number: <strong>${certNumber}</strong></p>
      <p>Log in to your InternshipWala dashboard to download it.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 12px; color: #999;">
        InternshipWala Careers · career.internshipwala@gmail.com
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: env.MAIL_FROM,
      to: email,
      subject: 'InternshipWala — Your Certificate is Ready',
      html,
    });
    logger.info('Certificate ready email sent', { to: email, certNumber });
  } catch (err) {
    logger.error('Failed to send certificate email', { to: email, error: err.message });
  }
};
