/**
 * Course Controller
 *
 * HTTP boundary for public course operations.
 */

import { sendSuccess } from '../utils/response.js';
import { MESSAGES } from '../constants/messages.js';

export class CourseController {
  /**
   * @param {import('../services/course.service.js').CourseService} courseService
   */
  constructor(courseService) {
    this.courseService = courseService;
  }

  /**
   * GET /api/courses
   */
  listPublic = async (req, res, next) => {
    try {
      const result = await this.courseService.listPublic(req.query);
      return sendSuccess(res, 200, MESSAGES.COURSES_FETCHED, result.courses, result.meta);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * GET /api/courses/:id
   */
  getDetail = async (req, res, next) => {
    try {
      const result = await this.courseService.getDetail(req.params.id);
      return sendSuccess(res, 200, MESSAGES.COURSE_FETCHED, result);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * GET /api/courses/categories
   */
  listCategories = async (_req, res, next) => {
    try {
      const categories = await this.courseService.listCategories();
      return sendSuccess(res, 200, MESSAGES.CATEGORIES_FETCHED, categories);
    } catch (err) {
      return next(err);
    }
  };
}
