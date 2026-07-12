import api from './api';

const courseService = {
  async listCourses(params = {}) {
    return api.get('/courses', { params });
  },

  async getCourseDetail(id) {
    return api.get(`/courses/${id}`);
  },

  async getCategories() {
    return api.get('/courses/categories');
  },
};

export default courseService;
