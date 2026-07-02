/**
 * Rate Limiter Middleware
 *
 * Three tiers as specified in Backend-Architecture.md Section 7.5.
 * All limiters use an in-memory store — no Redis dependency in v1.
 *
 * ┌─────────────────┬────────────────────────────────────────┬──────────┬──────────────┐
 * │ Export          │ Applied to                             │ Window   │ Max requests │
 * ├─────────────────┼────────────────────────────────────────┼──────────┼──────────────┤
 * │ authLimiter     │ /api/auth/*  (all auth endpoints)      │ 15 min   │ 20           │
 * │ otpLimiter      │ /api/auth/resend-otp, /api/auth/verify │ 15 min   │ 5            │
 * │ globalLimiter   │ All routes                             │ 1 min    │ 100          │
 * └─────────────────┴────────────────────────────────────────┴──────────┴──────────────┘
 *
 * Configuration is driven by env.js so limits can be adjusted per environment
 * without a code change.
 *
 * The limiters are exported individually so routes can apply the correct tier:
 *
 *   // In auth.routes.js:
 *   router.use(authLimiter);
 *   router.post('/resend-otp', otpLimiter, ...);
 *   router.post('/verify-otp', otpLimiter, ...);
 *
 *   // In app.js (global):
 *   app.use(globalLimiter);
 */

import expressRateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { MESSAGES } from '../constants/messages.js';

/**
 * Shared rate limit exceeded handler.
 * Returns the standard error response shape used across the API.
 *
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
const onLimitReached = (_req, res) => {
  res.status(429).json({
    success: false,
    message: MESSAGES.TOO_MANY_REQUESTS,
  });
};

/**
 * Auth limiter — applied to all /api/auth/* routes.
 * 20 requests per 15-minute window per IP.
 */
export const authLimiter = expressRateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,   // 900 000 ms = 15 minutes
  max: env.AUTH_RATE_LIMIT_MAX,               // 20 requests
  standardHeaders: true,   // Return RateLimit-* headers in the response
  legacyHeaders: false,    // Disable the deprecated X-RateLimit-* headers
  handler: onLimitReached,
});

/**
 * OTP limiter — applied specifically to resend-otp and verify-otp endpoints.
 * 5 requests per 15-minute window per IP — tighter than the general auth limit
 * to prevent OTP brute-force attacks.
 */
export const otpLimiter = expressRateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,   // 900 000 ms = 15 minutes (same window)
  max: env.OTP_RATE_LIMIT_MAX,               // 5 requests
  standardHeaders: true,
  legacyHeaders: false,
  handler: onLimitReached,
});

/**
 * Global limiter — applied to every route in the application.
 * 100 requests per 1-minute window per IP.
 * Acts as a baseline DDoS protection layer.
 */
export const globalLimiter = expressRateLimit({
  windowMs: 60 * 1000,                       // 1 minute (fixed — not configurable per spec)
  max: env.GLOBAL_RATE_LIMIT_MAX,            // 100 requests
  standardHeaders: true,
  legacyHeaders: false,
  handler: onLimitReached,
});
