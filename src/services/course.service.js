/**
 * Course Service
 *
 * Business logic for public course operations.
 */

import { AppError } from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';
import { parsePaginationQuery, buildPaginationMeta } from '../utils/pagination.js';

export class CourseService {
  /**
   * @param {import('../repositories/interfaces/ICourseRepository.js').ICourseRepository} courseRepo
   */
  constructor(courseRepo) {
    this.courseRepo = courseRepo;
  }

  /**
   * List published courses with optional category/type filters and pagination.
   * @param {{ category?: string, type?: string, page?: number, limit?: number }} query
   * @returns {Promise<{ courses: object[], meta: object }>}
   */
  async listPublic(query) {
    const pagination = parsePaginationQuery(query);
    const filters = {
      category_id: query.category,
      type: query.type,
    };

    const [courses, total] = await Promise.all([
      this.courseRepo.listPublic(filters, { skip: pagination.skip, take: pagination.take }),
      this.courseRepo.countPublic(filters),
    ]);

    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);
    return { courses, meta };
  }

  /**
   * Fetch one public course by ID with modules and duration fee options.
   * @param {string} id
   * @returns {Promise<{ course: object, modules: object[], durationFees: object[] }>}
   */
  async getDetail(id) {
    const record = await this.courseRepo.findPublicById(id);
    if (!record) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    const modules = Array.isArray(record.course_modules) ? record.course_modules : [];
    const durationFees = Array.isArray(record.course_duration_fees) ? record.course_duration_fees : [];

    const course = { ...record };
    delete course.course_modules;
    delete course.course_duration_fees;

    return {
      course,
      modules,
      durationFees,
    };
  }

  /**
   * List active categories for public course navigation/filtering.
   * @returns {Promise<object[]>}
   */
  async listCategories() {
    return this.courseRepo.listActiveCategories();
  }
}
