/**
 * Nodemailer SMTP Transporter Configuration
 *
 * Creates and exports a single shared Nodemailer transporter instance.
 * All mail sending in the application goes through this transporter.
 *
 * Configuration is loaded from env.js (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).
 *
 * The transporter is created lazily on first import — it does not attempt
 * to connect to the SMTP server at startup, only when sendMail() is called.
 */

import nodemailer from 'nodemailer';
import { env } from './env.js';

/**
 * Shared Nodemailer transporter.
 * Uses SMTP with STARTTLS (port 587 by default).
 */
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true for port 465 (SSL), false for 587 (STARTTLS)
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export default transporter;
