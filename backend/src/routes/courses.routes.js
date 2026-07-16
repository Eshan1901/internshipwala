/**
 * Public Course Routes
 *
 * Dependency injection: ICourseRepository -> CourseService -> CourseController.
 */

import { Router } from 'express';

import { PgCourseRepository } from '../repositories/pg/PgCourseRepository.js';
import { CourseService } from '../services/course.service.js';
import { CourseController } from '../controllers/course.controller.js';
import { validate } from '../middlewares/validate.js';
import asyncHandler from '../utils/asyncHandler.js';

import {
  listPublicCoursesQuerySchema,
  courseIdParamSchema,
} from '../validators/course.validator.js';

const courseRepo = new PgCourseRepository();
const courseService = new CourseService(courseRepo);
const courseController = new CourseController(courseService);

const router = Router();

// GET /api/courses
router.get(
  '/',
  validate(listPublicCoursesQuerySchema, 'query'),
  asyncHandler(courseController.listPublic)
);

// GET /api/courses/categories
router.get(
  '/categories',
  asyncHandler(courseController.listCategories)
);

// GET /api/courses/:id
router.get(
  '/:id',
  validate(courseIdParamSchema, 'params'),
  asyncHandler(courseController.getDetail)
);

export default router;
