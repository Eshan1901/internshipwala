/**
 * MockCourseRepository
 *
 * In-memory repository implementation for course APIs during
 * application-layer development before Prisma integration.
 */

import { ICourseRepository } from '../interfaces/ICourseRepository.js';
import { CourseStatus, CourseType } from '../../constants/enums.js';

const categories = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Computer Science Engineering',
    slug: 'computer-science-engineering',
    department: 'Engineering',
    colour_code: '#2563EB',
    is_active: true,
    display_order: 1,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Mechanical Engineering',
    slug: 'mechanical-engineering',
    department: 'Engineering',
    colour_code: '#EA580C',
    is_active: true,
    display_order: 2,
  },
];

const courses = [
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    category_id: '11111111-1111-4111-8111-111111111111',
    created_by: '00000000-0000-4000-8000-000000000001',
    title: 'Full Stack Web Development Internship',
    description: 'Hands-on internship covering frontend, backend, and deployment.',
    type: CourseType.ONLINE,
    status: CourseStatus.PUBLISHED,
    is_new_badge: true,
    syllabus: 'HTML, CSS, JavaScript, Node.js, Express.js, SQL basics',
    skills_covered: 'REST APIs, Git workflows, deployment',
    tools_used: 'VS Code, GitHub, Postman',
    thumbnail_url: '/uploads/certificates/mock-course-1.png',
    deleted_at: null,
  },
  {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    category_id: '22222222-2222-4222-8222-222222222222',
    created_by: '00000000-0000-4000-8000-000000000001',
    title: 'Industrial Training in CAD and Manufacturing',
    description: 'Mechanical domain internship with design-to-production workflow.',
    type: CourseType.INDUSTRIAL,
    status: CourseStatus.PUBLISHED,
    is_new_badge: false,
    syllabus: 'CAD fundamentals, process planning, QA checks',
    skills_covered: 'Mechanical design, workshop process understanding',
    tools_used: 'AutoCAD, SolidWorks',
    thumbnail_url: '/uploads/certificates/mock-course-2.png',
    deleted_at: null,
  },
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    category_id: '11111111-1111-4111-8111-111111111111',
    created_by: '00000000-0000-4000-8000-000000000001',
    title: 'Draft Course Example',
    description: 'Not publicly visible because it is draft.',
    type: CourseType.OFFLINE,
    status: CourseStatus.DRAFT,
    is_new_badge: false,
    syllabus: null,
    skills_covered: null,
    tools_used: null,
    thumbnail_url: null,
    deleted_at: null,
  },
];

const courseModules = [
  {
    id: 'd1111111-1111-4111-8111-111111111111',
    course_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    module_no: 1,
    title: 'Web Fundamentals',
    description: 'Internet, client-server basics, and semantic HTML.',
    content_url: 'https://example.com/module/1',
    content_type: 'video',
    is_active: true,
  },
  {
    id: 'd2222222-2222-4222-8222-222222222222',
    course_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    module_no: 2,
    title: 'Backend APIs',
    description: 'Build and test REST APIs with Express.',
    content_url: 'https://example.com/module/2',
    content_type: 'video',
    is_active: true,
  },
  {
    id: 'e1111111-1111-4111-8111-111111111111',
    course_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    module_no: 1,
    title: 'CAD Basics',
    description: '2D/3D CAD drafting foundations.',
    content_url: 'https://example.com/module/3',
    content_type: 'pdf',
    is_active: true,
  },
];

const durationFees = [
  {
    id: 'f1111111-1111-4111-8111-111111111111',
    course_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    duration_weeks: 8,
    label: '2 Months',
    fee: 4999,
    is_active: true,
  },
  {
    id: 'f2222222-2222-4222-8222-222222222222',
    course_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    duration_weeks: 12,
    label: '3 Months',
    fee: 6999,
    is_active: true,
  },
  {
    id: 'f3333333-3333-4333-8333-333333333333',
    course_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    duration_weeks: 6,
    label: '6 Weeks',
    fee: 5999,
    is_active: true,
  },
];

const clone = (value) => JSON.parse(JSON.stringify(value));

export class MockCourseRepository extends ICourseRepository {
  async listPublic(filters, pagination) {
    const categoryId = filters?.category_id;
    const type = filters?.type;

    let result = courses.filter(
      (course) => course.status === CourseStatus.PUBLISHED && course.deleted_at === null
    );

    if (categoryId) {
      result = result.filter((course) => course.category_id === categoryId);
    }

    if (type) {
      result = result.filter((course) => course.type === type);
    }

    const start = pagination?.skip ?? 0;
    const end = start + (pagination?.take ?? 10);

    return clone(
      result.slice(start, end).map((course) => ({
        ...course,
        category: categories.find((category) => category.id === course.category_id) || null,
      }))
    );
  }

  async countPublic(filters) {
    const categoryId = filters?.category_id;
    const type = filters?.type;

    let result = courses.filter(
      (course) => course.status === CourseStatus.PUBLISHED && course.deleted_at === null
    );

    if (categoryId) {
      result = result.filter((course) => course.category_id === categoryId);
    }

    if (type) {
      result = result.filter((course) => course.type === type);
    }

    return result.length;
  }

  async findPublicById(id) {
    const course = courses.find(
      (item) => item.id === id && item.status === CourseStatus.PUBLISHED && item.deleted_at === null
    );

    if (!course) {
      return null;
    }

    const category = categories.find((item) => item.id === course.category_id) || null;
    const modules = courseModules
      .filter((item) => item.course_id === course.id && item.is_active)
      .sort((a, b) => a.module_no - b.module_no);
    const fees = durationFees.filter((item) => item.course_id === course.id && item.is_active);

    return clone({
      ...course,
      category,
      course_modules: modules,
      course_duration_fees: fees,
    });
  }

  async listActiveCategories() {
    const result = categories
      .filter((category) => category.is_active)
      .sort((a, b) => a.display_order - b.display_order);

    return clone(result);
  }
}
