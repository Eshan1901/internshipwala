/**
 * OTP Generation Utility
 *
 * Generates a cryptographically random numeric OTP for email verification
 * and password reset flows.
 *
 * Specification (from Backend-Architecture.md):
 *  - 6 digits, numeric only
 *  - Stored temporarily in otp_verifications table
 *  - Expires in OTP_EXPIRY_MINUTES (default: 15 minutes)
 *  - Purged after use by the OTP cleanup cron job
 *
 * Rules (from AI_INSTRUCTIONS.md):
 *  - Never log OTP values, even at debug level.
 *  - Never return OTP values in API responses.
 */

import { randomInt } from 'crypto';

/**
 * Generate a 6-digit numeric OTP string.
 * Uses Node.js crypto.randomInt for cryptographic randomness.
 * The result is zero-padded to always be exactly 6 characters.
 *
 * @returns {string} 6-digit OTP, e.g. "042891"
 */
export const generateOtp = () => {
  // randomInt(min, max) — max is exclusive, so 1_000_000 gives 000000–999999
  const value = randomInt(0, 1_000_000);
  return String(value).padStart(6, '0');
};

/**
 * Calculate the OTP expiry timestamp.
 *
 * @param {number} [expiryMinutes=15] - Number of minutes until expiry
 * @returns {Date} Expiry Date object
 */
export const getOtpExpiry = (expiryMinutes = 15) => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + expiryMinutes);
  return expiry;
};
