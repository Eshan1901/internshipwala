/**
 * Winston Logger Configuration
 *
 * Provides a single shared logger instance used across the entire application.
 * Transports:
 *  - logs/error.log   — error level only
 *  - logs/combined.log — all levels
 *  - Console          — development only (colorized)
 *
 * Log levels: error > warn > info > http > debug
 *
 * Rules (from AI_INSTRUCTIONS.md):
 *  - Never log passwords, tokens, OTPs, or sensitive personal information.
 *  - Always log errors, important business events, and all HTTP requests.
 */

import winston from 'winston';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

// In production, suppress debug logs. In development, log everything.
const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logger = winston.createLogger({
  level: LOG_LEVEL,

  // JSON format for file transports — machine-parseable for log aggregators
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // include stack traces for Error objects
    json()
  ),

  transports: [
    // Error-level logs only — for alerting and post-mortem analysis
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),

    // All levels — full application log
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Development: add colorized console output
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'HH:mm:ss' }),
        simple()
      ),
    })
  );
}

export default logger;
