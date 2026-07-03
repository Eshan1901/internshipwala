/**
 * ICourseRepository - Course Repository Interface (Contract)
 *
 * Defines every course-related data-access method required by the
 * application layer. Concrete implementation will be provided by
 * the database layer using Prisma.
 */

export class ICourseRepository {
  /**
   * List published, non-deleted courses with optional filters.
   * @param {{ category_id?: string, type?: string }} filters
   * @param {{ skip: number, take: number }} pagination
   * @returns {Promise<object[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async listPublic(filters, pagination) { throw new Error('ICourseRepository.listPublic not implemented'); }

  /**
   * Count published, non-deleted courses matching optional filters.
   * @param {{ category_id?: string, type?: string }} filters
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line no-unused-vars
  async countPublic(filters) { throw new Error('ICourseRepository.countPublic not implemented'); }

  /**
   * Find one published, non-deleted course by ID.
   * Should include category, modules (ordered), and duration fee options.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findPublicById(id) { throw new Error('ICourseRepository.findPublicById not implemented'); }

  /**
   * List active course categories for public consumption.
   * @returns {Promise<object[]>}
   */
  async listActiveCategories() { throw new Error('ICourseRepository.listActiveCategories not implemented'); }
}
