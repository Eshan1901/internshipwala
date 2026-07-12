/**
 * JWT Configuration and Helpers
 *
 * Provides sign and verify functions for student and admin JWT tokens.
 * Two separate secrets are used so admin tokens cannot be used on student
 * endpoints and vice versa.
 *
 * JWT strategy (from Backend-Architecture.md Section 8.3):
 *  - Student token: STUDENT_JWT_SECRET, expiry 7d, payload { id, email, role: 'student' }
 *  - Admin token:   ADMIN_JWT_SECRET,   expiry 24h, payload { id, email, roles[], permissions[] }
 *  - Algorithm: HS256
 *  - No refresh tokens in v1
 */

import jwt from 'jsonwebtoken';
import { env } from './env.js';

/**
 * Sign a JWT for an authenticated student.
 *
 * @param {{ id: string, email: string }} payload - Student identity data
 * @returns {string} Signed JWT string
 */
export const signStudentToken = (payload) => {
  return jwt.sign(
    { id: payload.id, email: payload.email, role: 'student' },
    env.STUDENT_JWT_SECRET,
    { algorithm: 'HS256', expiresIn: env.STUDENT_JWT_EXPIRY }
  );
};

/**
 * Sign a JWT for an authenticated admin.
 *
 * @param {{ id: string, email: string, roles: string[], permissions: string[] }} payload
 * @returns {string} Signed JWT string
 */
export const signAdminToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      roles: payload.roles,
      permissions: payload.permissions,
    },
    env.ADMIN_JWT_SECRET,
    { algorithm: 'HS256', expiresIn: env.ADMIN_JWT_EXPIRY }
  );
};

/**
 * Verify a student JWT and return the decoded payload.
 * Throws a JsonWebTokenError or TokenExpiredError if invalid.
 *
 * @param {string} token - JWT string from Authorization header
 * @returns {{ id: string, email: string, role: string, iat: number, exp: number }}
 */
export const verifyStudentToken = (token) => {
  return jwt.verify(token, env.STUDENT_JWT_SECRET);
};

/**
 * Verify an admin JWT and return the decoded payload.
 * Throws a JsonWebTokenError or TokenExpiredError if invalid.
 *
 * @param {string} token - JWT string from Authorization header
 * @returns {{ id: string, email: string, roles: string[], permissions: string[], iat: number, exp: number }}
 */
export const verifyAdminToken = (token) => {
  return jwt.verify(token, env.ADMIN_JWT_SECRET);
};
