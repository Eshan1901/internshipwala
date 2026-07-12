/**
 * InternshipWala Backend — HTTP Server Entry Point
 *
 * Loads environment variables, imports the Express app, and starts
 * the HTTP server on the configured port.
 *
 * Phase 1: Minimal startup. Cron jobs and full middleware are wired
 * in later phases.
 */

import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`InternshipWala API server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
