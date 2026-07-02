/**
 * Security Middleware
 *
 * Applies all HTTP-level security protections to the Express application.
 * This module exports a single `applySecurityMiddleware(app)` function
 * that is called once in app.js before any routes are mounted.
 *
 * Stack (from Backend-Architecture.md Section 7.8 and Section 12):
 *
 *  1. helmet       — Sets secure HTTP response headers (XSS, clickjacking,
 *                    MIME sniffing, HSTS, etc.)
 *  2. cors         — Restricts cross-origin requests to whitelisted frontend
 *                    origins defined in ALLOWED_ORIGINS env var
 *  3. xss-clean    — Sanitizes all string values in req.body, req.query,
 *                    and req.params against XSS injection
 *  4. hpp          — Prevents HTTP Parameter Pollution by keeping only the
 *                    last value when a query param appears multiple times
 *  5. express.json — Parses JSON request bodies; hard limit of 10 KB to
 *                    prevent oversized payload attacks
 *  6. express.urlencoded — Parses URL-encoded bodies (form submissions)
 *
 * Note on xss-clean: The package is deprecated but is used here because
 * it is explicitly mandated in the project architecture specification.
 * This decision is recorded in DECISIONS.md.
 */

import helmet from 'helmet';
import cors from 'cors';
import xssClean from 'xss-clean';
import hpp from 'hpp';
import express from 'express';
import { env } from '../config/env.js';

/**
 * Build the CORS options from the ALLOWED_ORIGINS environment variable.
 * The env var holds a comma-separated list of allowed frontend origins.
 *
 * From Backend-Architecture.md Section 12.6:
 *   origin: process.env.ALLOWED_ORIGINS.split(',')
 *   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
 *   allowedHeaders: ['Content-Type', 'Authorization']
 *   credentials: true
 *
 * @returns {import('cors').CorsOptions}
 */
const buildCorsOptions = () => {
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim());

  return {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };
};

/**
 * Apply all security middleware to the Express application instance.
 * Must be called before routes are mounted.
 *
 * @param {import('express').Application} app - Express application instance
 */
export const applySecurityMiddleware = (app) => {
  // 1. Helmet — secure HTTP headers
  //    contentSecurityPolicy is configured to allow serving files from /uploads
  //    without breaking the static file serving (Section 12.7).
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // 2. CORS — restrict to whitelisted origins
  app.use(cors(buildCorsOptions()));

  // 3. XSS sanitization — scrubs req.body, req.query, req.params
  //    Required by current project documentation.
  //    Replace with express-mongo-sanitize / custom sanitization in a future revision
  //    if the architecture is updated.
  app.use(xssClean());

  // 4. HPP — strip duplicate query parameters, keep only the last value
  app.use(hpp());

  // 5. JSON body parser — 10 KB hard limit prevents oversized payload attacks
  app.use(express.json({ limit: '10kb' }));

  // 6. URL-encoded body parser — for standard HTML form submissions
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
};
