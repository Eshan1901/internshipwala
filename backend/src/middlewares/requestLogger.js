/**
 * Request Logger Middleware
 *
 * Logs every HTTP request and its response using the shared Winston logger.
 * Attaches to the Express response `finish` event so response time and
 * final status code are captured accurately.
 *
 * Logged fields (from Backend-Architecture.md Section 7.6):
 *   timestamp     — ISO datetime (added by Winston transport)
 *   method        — HTTP verb: GET, POST, PUT, PATCH, DELETE
 *   url           — Full request URL including query string
 *   status        — HTTP response status code
 *   response_time_ms — Time from request received to response sent
 *   ip            — Client IP address
 *   user_agent    — Client User-Agent header
 *
 * Log levels (from Section 7.6):
 *   'http'  — 2xx and 3xx responses (normal traffic)
 *   'warn'  — 4xx responses (client errors)
 *   'error' — 5xx responses (server errors)
 *
 * Rules (from AI_INSTRUCTIONS.md):
 *   Never log: passwords, tokens, OTPs, or sensitive personal information.
 *   The URL is logged as-is. Route handlers must never put secrets in URLs.
 */

import logger from '../logger/logger.js';

/**
 * Express middleware that logs each request/response cycle.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log after the response is fully sent so we have the final status code
  res.on('finish', () => {
    const responseTimeMs = Date.now() - startTime;
    const status = res.statusCode;

    const logData = {
      method: req.method,
      url: req.originalUrl,
      status,
      response_time_ms: responseTimeMs,
      ip: req.ip || req.socket?.remoteAddress || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown',
    };

    // Choose log level based on response status category
    if (status >= 500) {
      logger.error('HTTP request', logData);
    } else if (status >= 400) {
      logger.warn('HTTP request', logData);
    } else {
      logger.http('HTTP request', logData);
    }
  });

  next();
};

export default requestLogger;
