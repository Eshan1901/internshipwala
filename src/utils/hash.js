/**
 * Password Hashing Utilities
 *
 * Wrappers around bcrypt for hashing and comparing passwords.
 * Cost factor 12 is used as specified in the architecture document —
 * it balances security and performance at the platform's expected scale.
 *
 * Rules (from AI_INSTRUCTIONS.md):
 *  - Passwords are never logged, returned in API responses, or stored in plaintext.
 *  - Always use these helpers — never call bcrypt directly from services.
 */

import bcrypt from 'bcrypt';

/** bcrypt cost factor — do not lower below 12 */
const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt.
 *
 * @param {string} password - Plaintext password from user input
 * @returns {Promise<string>} bcrypt hash string
 */
export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a plaintext password against a stored bcrypt hash.
 * Returns false rather than throwing if the comparison fails —
 * let the caller decide how to handle a mismatch.
 *
 * @param {string} password - Plaintext password from user input
 * @param {string} hash - bcrypt hash stored in the database
 * @returns {Promise<boolean>} true if the password matches, false otherwise
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
