/**
 * Express Application Factory
 *
 * Middleware order (sequence is critical):
 *
 *  1. Security  — helmet, cors, xss-clean, hpp, body parsers
 *  2. Static    — /uploads file serving
 *  3. Logger    — request/response logging
 *  4. Limiter   — global rate limiter (100 req/min)
 *  5. [Routes] — mounted in later phases
 *  6. notFound  — 404 handler after all routes
 *  7. errorHandler — global error handler (must be last)
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { applySecurityMiddleware } from './middlewares/security.js';
import requestLogger from './middlewares/requestLogger.js';
import { globalLimiter } from './middlewares/rateLimiter.js';
import router from './routes/index.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';
import { env } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Security
applySecurityMiddleware(app);

// 2. Static uploads
app.use('/uploads', express.static(path.join(__dirname, '..', env.UPLOAD_DIR)));

// 3. Request logger
app.use(requestLogger);

// 4. Global rate limiter
app.use(globalLimiter);

// 5. Routes — /api prefix
app.use('/api', router);

// 6. 404 — must come after all routes
app.use(notFound);

// 7. Global error handler — must be last
app.use(errorHandler);

export default app;
