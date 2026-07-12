/**
 * Environment Variable Configuration
 *
 * Loads and validates all required environment variables using Zod.
 * The application refuses to start if any required variable is missing
 * or fails validation.
 *
 * Import `env` wherever a config value is needed instead of accessing
 * process.env directly. This guarantees every value is present and
 * correctly typed at runtime.
 */

import { z } from 'zod';

const envSchema = z.object({
  // ── Application ──────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // ── CORS ─────────────────────────────────────────────────────────
  ALLOWED_ORIGINS: z.string().min(1).default('http://localhost:5173,http://localhost:3000'),

  // ── Database ─────────────────────────────────────────────────────
  // Required in production; optional during early development phases
  // before the database developer delivers the connection string.
  DATABASE_URL: z.string().optional(),

  // ── JWT ──────────────────────────────────────────────────────────
  STUDENT_JWT_SECRET: z.string().min(32).default('dev_student_secret_replace_in_production_env'),
  ADMIN_JWT_SECRET: z.string().min(32).default('dev_admin_secret_replace_in_production_env'),
  STUDENT_JWT_EXPIRY: z.string().default('7d'),
  ADMIN_JWT_EXPIRY: z.string().default('24h'),

  // ── OTP ──────────────────────────────────────────────────────────
  OTP_EXPIRY_MINUTES: z.coerce.number().int().positive().default(15),
  OTP_LENGTH: z.coerce.number().int().positive().default(6),

  // ── Mail (SMTP) ───────────────────────────────────────────────────
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  MAIL_FROM: z.string().default('InternshipWala <career.internshipwala@gmail.com>'),

  // ── File Upload ───────────────────────────────────────────────────
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_PROFILE_PHOTO_SIZE_MB: z.coerce.number().positive().default(2),
  MAX_PROJECT_FILE_SIZE_MB: z.coerce.number().positive().default(10),

  // ── Rate Limiting ─────────────────────────────────────────────────
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  OTP_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  GLOBAL_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  // ── Hard Copy Fee ─────────────────────────────────────────────────
  DEFAULT_HARD_COPY_FEE: z.coerce.number().positive().default(500),

  // ── Cloud Storage (Optional) ──────────────────────────────────────
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // AWS S3 / R2 / Supabase
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_ENDPOINT: z.string().optional(),
});

/**
 * Parsed and validated environment configuration.
 * Exits the process with a descriptive message if any variable is invalid.
 */
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  const formatted = parseResult.error.issues
    .map((issue) => `  • ${issue.path.join('.') || 'root'}: ${issue.message}`)
    .join('\n');

  // eslint-disable-next-line no-console
  console.error('\n❌  Environment validation failed. Fix the following issues:\n');
  // eslint-disable-next-line no-console
  console.error(formatted);
  // eslint-disable-next-line no-console
  console.error('\nSee .env.example for required variables.\n');
  process.exit(1);
}

export const env = parseResult.data;
