/**
 * Master Router
 *
 * Mounts all sub-routers under the /api prefix.
 * Additional module routers are added here as each phase is completed.
 */

import { Router } from 'express';
import authRouter from './auth.routes.js';
import adminRouter from './admin/index.js';
import userRouter from './user.routes.js';
import coursesRouter from './courses.routes.js';
import notificationsRouter from './notifications.routes.js';
import enrollmentRouter from './enrollment.routes.js';
import paymentsRouter from './payments.routes.js';
import certificatesRouter from './certificates.routes.js';
import blogRouter from './blog.routes.js';
import jobsRouter from './jobs.routes.js';

const router = Router();

// ── Authentication ────────────────────────────────────────────────────────────
router.use('/auth', authRouter);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.use('/admin', adminRouter);

// ── User profile ──────────────────────────────────────────────────────────────
router.use('/user', userRouter);

// ── Public courses ────────────────────────────────────────────────────────────
router.use('/courses', coursesRouter);

// ── Student notifications ─────────────────────────────────────────────────────
router.use('/notifications', notificationsRouter);

// ── Enrollments ───────────────────────────────────────────────────────────────
router.use('/enrollments', enrollmentRouter);

// ── Payments ──────────────────────────────────────────────────────────────────
router.use('/payments', paymentsRouter);

// ── Certificates ──────────────────────────────────────────────────────────────
router.use('/certificates', certificatesRouter);

// ── Blog ──────────────────────────────────────────────────────────────────────
router.use('/blog', blogRouter);

// ── Jobs ──────────────────────────────────────────────────────────────────────
router.use('/jobs', jobsRouter);

// ── Future modules (added in later phases) ────────────────────────────────────
// router.use('/user', userRouter);
// router.use('/enrollments', enrollmentRouter);
// router.use('/payments', paymentsRouter);
// router.use('/certificates', certificatesRouter);
// router.use('/jobs', jobsRouter);
// router.use('/blog', blogRouter);
// router.use('/notifications', notificationsRouter);
// router.use('/public', publicRouter);
// router.use('/contact', contactRouter);
// router.use('/admin', adminRouter);

export default router;
